"use client"
import { Threads } from 'openai/src/resources/beta/index.js'
import React, { useState } from 'react'

function ChatPage() {
  const [fetching, setFetching] = useState(true)
  const [messages, setMessages] = useState<Threads[]>([])

  const fetchmessages = async () => {
    
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
