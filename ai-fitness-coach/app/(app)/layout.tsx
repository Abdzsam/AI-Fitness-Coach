"use client"
import Navbar from "@/components/Navbar";
import axios from "axios";
import { UserThread } from "@prisma/client";
import { useEffect, useState } from "react";

export default function AppLayout({children}: Readonly<{children: React.ReactNode}>) {
    
  const [userThread, setUserThread] = useState<UserThread | null>(null)

  useEffect(() => {

    async function getUserThread() {
      try {
        const response = await axios.get<{
      success: boolean,
      message?: string,
      userThread: UserThread
      }>("/api/user-thread")
      
      if(!response.data.success  || !response.data.userThread){
        console.error(response.data.message ?? "Unknown error.")
        setUserThread(null)
      }

      setUserThread(response.data.userThread)
      }
      catch (error) {
        console.error(error)
        setUserThread(null)
      }
      
    }
    
    getUserThread()
  },[])

  return (
      <div className="flex flex-col w-full h-full">
        <Navbar/>
        {children}
      </div>
    );
  }