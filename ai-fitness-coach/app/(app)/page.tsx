  "use client"
  import { assistantAtom, userThreadAtom } from '@/atoms';
  import axios from 'axios'
  import { useAtom } from 'jotai';
  import { Message } from "openai/resources/beta/threads/messages.js";
  import { Run } from 'openai/resources/beta/threads/runs/runs.mjs';
  import React, { useCallback, useEffect, useState } from 'react'
  import toast from "react-hot-toast" 

  const POLLING_FREQUENCY_MS = 1000;

  function ChatPage() {

    const [userThread] = useAtom(userThreadAtom)
    const [assistant] = useAtom(assistantAtom)

    const [fetching, setFetching] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [pollingRun, setPollingRun] = useState(false);

    console.log(userThread?.threadId)

    const fetchmessages = useCallback(
      async () => {
        if(!userThread) return
    
        setFetching(true)
    
        try {
          const response = await axios.post<{success: boolean,error?: string, messages?: Message[]}>("/api/message/list", {threadId: userThread.threadId})
    
        if(!response.data.success || !response.data.messages) {
          console.error(response.data.error ?? "Unknown error.")
          setFetching(false)
          return
        }
    
        let newMessages = response.data.messages
    
        newMessages = newMessages.sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }).filter(message => message.content[0].type === "text" &&  message.content[0].text.value.trim() !== ""
        )
    
        setMessages(newMessages)
        }
        catch (err) {
          console.error(err)
          setMessages([])
        }
        finally {
          setFetching(false)
        }
      }
    , [userThread])

    useEffect(() => {
      const interValid = setInterval(fetchmessages,POLLING_FREQUENCY_MS)

      return () => clearInterval(interValid)
    },[fetchmessages])

    const startRun = async (threadId: string, assistantId: string): Promise<string> => {
      try {
        const {data: { success, run, error },} = await axios.post<{ success: boolean; error?: string; run?: Run}>("api/run/create", {threadId,assistantId,});

        if (!success || !run) {
          console.error(error);
          toast.error("Failed to start run.");
          return "";
        }

        return run.id;
      } catch (error) {
        console.error(error);
        toast.error("Failed to start run.");
        return "";
      }
    }

    const pollRunStatus = async (threadId: string, runId: string) => {
      setPollingRun(true);

      const intervalId = setInterval(async () => {
          try {
          const {data: { run, success, error },} = await axios.post<{success: boolean;error?: string;run?: Run;}>("api/run/retrieve", {threadId,runId,});

          if (!success || !run) {
            console.error(error);
            toast.error("Failed to poll run status.");
            return;
          }

          console.log("run", run);

          if (run.status === "completed") {
            clearInterval(intervalId);
            setPollingRun(false);
            fetchmessages();
            return;
          } else if (run.status === "failed") {
            clearInterval(intervalId);
            setPollingRun(false);
            toast.error("Run failed.");
            return;
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to poll run status.");
          clearInterval(intervalId);
        }
      }, POLLING_FREQUENCY_MS);

      return () => clearInterval(intervalId);
    }
    
    const sendMessage = async () => {

      if(!userThread || sending || !assistant) {
        toast.error("Failed to send message. Invalid State.")
        return
      }

      setSending(true)
      
      try{
        const { data: { message: newMessages }, } = await axios.post<{ success: boolean, message?: Message, error?: string}>("/api/message/create", { message, threadId: userThread.threadId, fromUser: "true",})

      if(!newMessages){
        console.error("No messages returned")
        toast.error("Failed to send message. Please try again.")
        return
      }

      setMessages((prev) => [...prev,newMessages])
      setMessage("")
      toast.success("Message sent.")

      const runId = await startRun(userThread.threadId, assistant.assistantId)
      if (!runId) {
        toast.error("Failed to start run.");
        return;
      }
      pollRunStatus(userThread.threadId, runId)
      }
      catch(err) {
        console.error("Failed to send message")
        toast.error("Failed to send message. PLease try again.")
      }
      finally{
        setSending(false)
      }
    }

    return (
      <div className='w-screen h-screen flex flex-col bg-blue-900 text-yellow-400'>
        <div className='flex-grow overflow-y-scroll p-8 space-y-2'>
          {fetching && messages.length === 0 && <div className='text-center font-bold'>Fetching...</div>}
          {messages.length === 0 && !fetching && (<div className='text-center font-bold'>No Messages...</div>)}
          {messages.map(message => (<div className={`px-4 py-2 mb-3 rounded-lg w-fit text-lg ${["true","True"].includes(
            (message.metadata as {fromUser?: string}).fromUser ?? ""
          ) ? "bg-yellow-400 ml-auto text-blue-950" : "bg-blue-950 text-yellow-400"}`} key={message.id}>{message.content[0].type === "text" ? message.content[0].text.value.split("\n").map((text, index) => <p key={index}>{text}</p>) : null}</div>))}
        </div>

        <div className='mt-auto p-4 bg-blue-900'>
          <div className='flex items-center bg-blue-950 rounded-full p-2'>
            <input type='text' className='flex-grow bg-transparent text-yellow-400 focus:outline-none rounded-lg p-3' placeholder='Type a message...' value={message} onChange={(e) => setMessage(e.target.value)}/>
            <button disabled={!userThread?.threadId || !assistant || sending || !message.trim()} className='ml-4 bg-yellow-400 text-blue-950 px-10 py-3 rounded-full focus:outline-none disabled:bg-yellow-600' onClick={sendMessage}>{sending ? "Sending..." : pollingRun ? "Polling..." : "Send"}</button>
          </div>  
        </div>

      </div>
    )
  }

  export default ChatPage
