"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Assuming User type is available, otherwise define it
interface User {
  id: string;
  name: string | null;
  email: string | null;
}

const sharedGoalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  thrustArea: z.string().min(1, "Thrust area is required"),
  target: z.coerce.number().min(0, "Target must be a positive number"),
  uom: z.enum(["NUMERIC", "PERCENTAGE", "TIMELINE", "ZERO_BASED"]),
  employeeIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one employee.",
  }),
  defaultWeightage: z.coerce.number().min(10, "Weightage must be at least 10").max(100, "Weightage cannot exceed 100"),
});

type SharedGoalFormValues = z.infer<typeof sharedGoalSchema>;

export function CreateSharedGoalForm() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    }
    fetchUsers();
  }, []);

  const form = useForm<SharedGoalFormValues>({
    resolver: zodResolver(sharedGoalSchema),
    defaultValues: {
      employeeIds: [],
      defaultWeightage: 10,
    },
  });

  async function onSubmit(data: SharedGoalFormValues) {
    const response = await fetch("/api/shared-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.push("/dashboard"); // Or a page showing all shared goals
      router.refresh();
    } else {
      const error = await response.json();
      alert(`Failed to create shared goal: ${error.message}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl><Input placeholder="e.g., Increase Customer Satisfaction" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl><Textarea placeholder="Provide a detailed description of the goal..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thrustArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thrust Area</FormLabel>
              <FormControl><Input placeholder="e.g., Quality" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="uom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement (UoM)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a UoM" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="NUMERIC">Numeric</SelectItem>
                  <SelectItem value="PERCENTAGE">%</SelectItem>
                  <SelectItem value="TIMELINE">Timeline</SelectItem>
                  <SelectItem value="ZERO_BASED">Zero-based</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target</FormLabel>
              <FormControl><Input type="number" placeholder="e.g., 95" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="defaultWeightage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Weightage (%)</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormDescription>This will be the initial weightage for all selected employees.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employeeIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Share With</FormLabel>
                <FormDescription>Select the employees who will receive this goal.</FormDescription>
              </div>
              <div className="space-y-2">
                {users.map((user) => (
                  <FormField
                    key={user.id}
                    control={form.control}
                    name="employeeIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={user.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(user.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, user.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== user.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {user.name} ({user.email})
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Shared Goal</Button>
      </form>
    </Form>
  );
}
