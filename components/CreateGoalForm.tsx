"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { UoM } from "@prisma/client"

const formSchema = z.object({
  thrustArea: z.string().min(1, "Thrust area is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  uom: z.nativeEnum(UoM),
  target: z.coerce.number().min(0, "Target must be a positive number"),
  weightage: z.coerce.number().min(10, "Minimum weightage is 10%").max(100, "Maximum weightage is 100%"),
})

export function CreateGoalForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thrustArea: "",
      title: "",
      description: "",
      weightage: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      console.log("Goal created successfully!");
      // Later, we'll redirect or show a success message
    } else {
      const error = await response.json();
      console.error("Failed to create goal:", error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div>
        <label htmlFor="thrustArea">Thrust Area</label>
        <input id="thrustArea" {...register("thrustArea")} className="w-full border p-2 rounded" />
        {errors.thrustArea && <p className="text-red-500 text-sm">{errors.thrustArea.message}</p>}
      </div>

      <div>
        <label htmlFor="title">Goal Title</label>
        <input id="title" {...register("title")} className="w-full border p-2 rounded" />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea id="description" {...register("description")} className="w-full border p-2 rounded" />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="uom">Unit of Measurement</label>
          <select id="uom" {...register("uom")} className="w-full border p-2 rounded">
            {Object.values(UoM).map((uom) => (
              <option key={uom} value={uom}>{uom}</option>
            ))}
          </select>
          {errors.uom && <p className="text-red-500 text-sm">{errors.uom.message}</p>}
        </div>

        <div>
          <label htmlFor="target">Target</label>
          <input id="target" type="number" {...register("target")} className="w-full border p-2 rounded" />
          {errors.target && <p className="text-red-500 text-sm">{errors.target.message}</p>}
        </div>

        <div>
          <label htmlFor="weightage">Weightage (%)</label>
          <input id="weightage" type="number" {...register("weightage")} className="w-full border p-2 rounded" />
          {errors.weightage && <p className="text-red-500 text-sm">{errors.weightage.message}</p>}
        </div>
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit Goal</button>
    </form>
  )
}

