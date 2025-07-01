import { Card } from "@/components/ui/card";
import { HeartPlus } from "lucide-react";
import { SlBookOpen } from "react-icons/sl";

const HomeTasks = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-[#262636] border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <HeartPlus />
          </div>
          <div>
            <div className="text-white font-semibold">Meditate</div>
            <div className="text-sm text-gray-400">Meditate for 10 minutes</div>
          </div>
        </div>
      </Card>

      <Card className="bg-[#262636] border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <SlBookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-white font-semibold">Read Books</div>
            <div className="text-sm text-gray-400">Read for 30 minutes</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HomeTasks;
