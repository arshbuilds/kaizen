import { AuthGate } from "../components/Auth/AuthGate";
import { TasksGate } from "../components/TaskComponents/TasksGate";
import DashboardHeader from "../components/Home/DashboardHeader";
import ProgressCard  from "../components/Home/ProgressCard";
import HomeTasks  from "../components/Home/HomeTasks";
import QuickActions  from "../components/Home/QuickActions";
import TopTasks from "../components/Home/TopTasks";

export default function Home() {
  return (
    <AuthGate>
      <TasksGate>
        <div className="min-h-screen p-4 mx-auto pb-24">
          <div className="space-y-6">
            <DashboardHeader />
            <ProgressCard />
            <TopTasks />
            <HomeTasks />
            <QuickActions />
          </div>
        </div>
      </TasksGate>
    </AuthGate>
  );
}
