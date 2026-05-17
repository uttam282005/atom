import { CreateGoalForm } from "@/components/CreateGoalForm";

export default async function CreateGoalPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4">Create a New Goal</h1>
      <div className="max-w-2xl">
        <CreateGoalForm />
      </div>
    </div>
  );
}
