import { CreateGoalForm } from "@/components/CreateGoalForm";

export default function CreateGoalPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Create a New Goal</h1>
      <CreateGoalForm />
    </div>
  );
}
