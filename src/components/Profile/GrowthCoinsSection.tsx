import React from 'react'


const GrowthCoinsSection = (props: {totalCoins: number, weeklyCoins: number, todayCoins: number, percentileRank: number}) => {
    return (
    <div className="rounded-xl bg-[#1a2332] p-6 text-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Growth Coins</h3>
        <p className="text-xl text-yellow-400 font-semibold">{props.totalCoins}</p>
      </div>

      {/* Weekly Progress */}
      <div className="rounded-lg bg-[#403f5c] p-3 space-y-2">
        <div className="flex justify-between text-sm text-gray-300">
          <span>This Week</span>
          <span>+{props.weeklyCoins}</span>
        </div>
      </div>

      {/* Today & Ranking */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#403f5c] rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-2xl">📈</div>
          <p className="font-bold mt-1">+{props.todayCoins}</p>
          <p className="text-sm text-gray-300">Today</p>
        </div>
        <div className="bg-[#403f5c] rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-2xl">⭐</div>
          <p className="font-bold mt-1">Top {props.percentileRank}%</p>
          <p className="text-sm text-gray-300">Ranking</p>
        </div>
      </div>
    </div>
  );
}

export default GrowthCoinsSection