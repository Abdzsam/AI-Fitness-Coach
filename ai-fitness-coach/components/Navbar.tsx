'use client';


import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import React from 'react'

const routes = [
  {
    name: "Chat",
    path: "/",
  },
  {
    name: "Profile",
    path: "/profile"
  }
]

function Navbar() {
  const pathname = usePathname();
  return (
    <div className=' bg-blue-900 flex flex-row justify-between p-4'>
      <Link href='/'>
       <h1 className='text-2xl font-mono text-yellow-400'>Fit<span className='text-2xl font-semibold bg-yellow-400 text-blue-900 rounded-sm border-r-4 border-l-4 border-yellow-400 m-1'>AI</span></h1>
      </Link>
      <div className='flex gap-6 text-lg items-center text-yellow-400'>
        {routes.map((route,idx) => 
          (<Link 
          key={idx} 
          href={route.path} 
          className={pathname === route.path ? "border-b-2 border-yellow-400 text-yellow-400" : ""}>{route.name}</Link>))}

        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <SignInButton/>
        </SignedOut>
      </div>
    </div>
  )
}

export default Navbar
