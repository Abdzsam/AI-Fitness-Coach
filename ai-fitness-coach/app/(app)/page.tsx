"use client"
import { userThreadAtom } from '@/atoms';
import axios from 'axios'
import { useAtom } from 'jotai';
import { Message } from "openai/resources/beta/threads/messages.js";
import React, { useCallback, useEffect, useState } from 'react'
import toast from "react-hot-toast" 

const POLLING_FREQUENCY_MS = 1000;

function ChatPage() {

  const [userThread] = useAtom(userThreadAtom)

  const [fetching, setFetching] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const fetchmessages = useCallback(
    async () => {
      if(!userThread) return
  
      setFetching(true)
  
      try {
        const response = await axios.post<{success: boolean,error?: string, messages?: Message[]}>("/api/messages/list", {threadId: userThread.threadId})
  
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
  
  const sendMessage = async () => {

    if(!userThread || sending) return
    
    const { data: { message: newMessages }, } = await axios.post<{ success: boolean, message?: Message, error?: string}>
    ("/api/message/create", { message, threadId: userThread.threadId, fromUser: "true",})

    if(!newMessages){
      console.error("No messages returned")
      toast.error("Failed to send message. PLease try again.")
      return
    }

    setMessages((prev) => [...prev,newMessages])
  }

 

  return (
    <div className='w-screen h-screen flex flex-col bg-blue-950 text-yellow-400'>
      <div className='flex-grow overflow-y-hidden p-8 space-y-2'>
        {fetching && messages.length === 0 && <div className='text-center font-bold'>Fetching...</div>}
        {messages.length === 0 && !fetching && (<div className='text-center font-bold'>No Messages...</div>)}
        {messages.map(message => (<div className={`px-4 py-2 mb-3 rounded-lg w-fit text-lg ${["true","True"].includes(
          (message.metadata as {fromUser?: string}).fromUser ?? ""
        ) ? "bg-yellow-400 ml-auto" : "bg-blue-950"}`} key={message.id}>{message.content[0].type === "text" ? message.content[0].text.value.split("\n").map((text, index) => <p key={index}>{text}</p>) : null}</div>))}
      </div>

      <div className='mt-auto p-4 bg-gray-800'>
        <div className='flex items-center bg-white p-2'>
          <input type='text' className='flex-grow bg-transparent text-black focus:outline-none' placeholder='Type a message...' value={message} onChange={(e) => setMessage(e.target.value)}/>
          <button disabled={!userThread?.threadId || sending || !message.trim} className='ml-4 bg-yellow-400 text-blue-950 px-4 py-2 rounded-full focus:outline-none disabled:bg-gray-500'
          onClick={sendMessage}>Send</button>
        </div>  
      </div>

    </div>
  )
}



export default ChatPage
