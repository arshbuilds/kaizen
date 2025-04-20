import React from 'react'
import { IconType } from 'react-icons'

type Props = {
    icon: IconType,
    title: string,
    info: string,
}

export const StatCard = (props: Props) => {
  return (
   <div className="max-w-xs w-full">
      <div className="bg-purple-900/90 p-4 rounded-xl shadow-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-gradient-to-br from-pink-500 to-pink-600 p-2 rounded-full">
            <props.icon className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 text-gray-300 text-sm font-medium">Daily Focus</span>
        </div>
        <div className="mt-3">
          <h2 className="text-white text-2xl font-bold">4.5h</h2>
          <p className="text-red-400 text-sm font-medium">-22% vs last week</p>
        </div>
      </div>
    </div> 
  )
}
