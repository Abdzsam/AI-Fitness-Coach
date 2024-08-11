"use client"
import { userThreadAtom } from '@/atoms';
import axios from 'axios'
import { useAtom } from 'jotai';
import { Message } from "openai/resources/beta/threads/messages.js";
import React, { useCallback, useEffect, useState } from 'react'

const POLLING_FREQUENCY_MS = 1000;

function ChatPage() {

  const [userThread] = useAtom(userThreadAtom)

  const [fetching, setFetching] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])

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
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
  

  return (
    <div className='w-screen h-screen flex flex-col bg-blue-950 text-yellow-400'>
      <div className='flex-grow overflow-y-hidden p-8 space-y-2'>
        {fetching && messages.length === 0 && <div className='text-center font-bold'>Fetching...</div>}
        {messages.length === 0 && !fetching && (<div className='text-center font-bold'>No Messages...</div>)}
        {messages.map(message => (<div key={message.id}>{message.content[0].type === "text" ? message.content[0].text.value.split("\n").map((text, index) => <p key={index}>{text}</p>) : null}</div>))}
      </div>
    </div>
  )
}

export default ChatPage
