"use client"
import axios from 'axios'
import { Thread } from 'openai/src/resources/beta/index.js'
import React, { useState } from 'react'

function ChatPage() {
  const [fetching, setFetching] = useState(true)
  const [messages, setMessages] = useState<Thread[]>([])

  const fetchmessages = async () => {
    setFetching(true)

    const response = await axios.get<{success: boolean,error?: string, messages?: Thread[]}>("/api/messages/list")

    if(!response.data.success || !response.data.messages) {
      console.error(response.data.error ?? "Unknown error.")
      setFetching(false)
      return
    }

    let newMessages = response.data.messages

    newMessages = newMessages.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  return (
    <div className='w-screen h-screen flex flex-col bg-blue-950 text-yellow-400'>
      <div className='flex-grow overflow-y-hidden p-8 space-y-2'>
        {fetching && <div className='text-center font-bold'>Fetching...</div>}
        {messages.length === 0 && !fetching && (<div className='text-center font-bold'>No Messages...</div>)}
      </div>
    </div>
  )
}

export default ChatPage
