"use client"
import React, { useState } from 'react'

function ChatPage() {
  const [fetching, setFetching] = useState(true)
  return (
    <div className='w-screen h-screen flex flex-col bg-blue-950 text-yellow-400'>
      {fetching && <div className='text-center font-bold'>Fetching...</div>}
    </div>
  )
}

export default ChatPage
