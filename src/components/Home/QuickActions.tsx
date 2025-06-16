import { Button } from "@/components/ui/button"
import { Plus, Calendar, Bot, Target } from "lucide-react"

const QuickActions = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="transition h-20 bg-[#262636] focus:bg-slate-700 border-slate-700 hover:bg-slate-700  flex flex-col items-center gap-2"
        >
          <Plus className="w-6 h-6 text-green-400" />
          <span className="text-white">Add Task</span>
        </Button>

        <Button
          variant="outline"
          className="transition h-20 bg-[#262636] border-slate-700 hover:bg-slate-700 focus:bg-slate-700 flex flex-col items-center gap-2"
        >
          <Target className="w-6 h-6 text-green-400" />
          <span className="text-white">Add Habit</span>
        </Button>

        <Button
          variant="outline"
          className="transition h-20 bg-[#262636] focus:bg-slate-700 border-slate-700 hover:bg-slate-700 flex flex-col items-center gap-2"
        >
          <Calendar className="w-6 h-6 text-blue-400" />
          <span className="text-white">Calendar</span>
        </Button>

        <Button
          variant="outline"
          className="transition h-20 bg-[#262636] focus:bg-slate-700 border-slate-700 hover:bg-slate-700 flex flex-col items-center gap-2"
        >
          <Bot className="w-6 h-6 text-blue-400" />
          <span className="text-white">AI Coach</span>
        </Button>
      </div>
    </div>
  )
}
export default QuickActions;