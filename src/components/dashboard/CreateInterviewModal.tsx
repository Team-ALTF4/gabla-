// src/components/dashboard/CreateInterviewModal.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createInterview } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";

// --- STRATEGY CHANGE: Make booleans optional in the schema to resolve type conflict ---
const formSchema = z.object({
  hasWhiteboard: z.boolean().optional(),
  hasCodingChallenge: z.boolean().optional(),
  hasQuiz: z.boolean().optional(),
  quizTopic: z.string().optional(),
  quizQuestionCount: z.coerce.number().optional(),
  quizQuestionDuration: z.coerce.number().optional(),
}).refine(data => {
  if (data.hasQuiz) {
    return !!(data.quizTopic && data.quizTopic.length > 0 && data.quizQuestionCount && data.quizQuestionDuration);
  }
  return true;
}, {
  message: "All quiz details are required when quiz is enabled.",
  path: ["quizTopic"], 
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateInterviewModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    // Provide explicit, non-optional default values
    defaultValues: {
      hasWhiteboard: false,
      hasCodingChallenge: false,
      hasQuiz: false,
      quizTopic: "",
      quizQuestionCount: undefined,
      quizQuestionDuration: undefined,
    },
    mode: 'onChange',
  });

  const hasQuiz = form.watch('hasQuiz');

  const mutation = useMutation({
    mutationFn: createInterview,
    onSuccess: (data) => {
      toast.success('Interview created successfully!', { description: `Room Code: ${data.roomCode}` });
      router.push(`/interview/${data.roomCode}`);
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to create interview', { description: error.message });
    },
  });

  function onSubmit(values: FormValues) {
    // --- STRATEGY CHANGE: Explicitly cast booleans before sending ---
    // This ensures our API receives a strict boolean, not undefined.
    const payload = {
      ...values,
      hasWhiteboard: !!values.hasWhiteboard,
      hasCodingChallenge: !!values.hasCodingChallenge,
      hasQuiz: !!values.hasQuiz,
      quizTopic: values.hasQuiz ? values.quizTopic : null,
      quizQuestionCount: values.hasQuiz ? values.quizQuestionCount : null,
      quizQuestionDuration: values.hasQuiz ? values.quizQuestionDuration : null,
    };
    mutation.mutate(payload);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Create New Interview</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Interview Session</DialogTitle>
          <DialogDescription>Configure the settings for your new interview.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField control={form.control} name="hasWhiteboard" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Enable Whiteboard?</FormLabel></FormItem>)} />
              <FormField control={form.control} name="hasCodingChallenge" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Enable Coding Challenge?</FormLabel></FormItem>)} />
              <FormField control={form.control} name="hasQuiz" render={({ field }) => (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>Enable Quiz?</FormLabel></FormItem>)} />
            </div>
            
            {hasQuiz && (
              <div className="grid gap-4 p-4 border rounded-md">
                <h4 className="font-semibold">Quiz Configuration</h4>
                <FormField control={form.control} name="quizTopic" render={({ field }) => (<FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="e.g., React Hooks" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="quizQuestionCount" render={({ field }) => (<FormItem><FormLabel>Number of Questions</FormLabel><FormControl><Input type="number" placeholder="5" {...field} value={field.value ?? ''} onChange={event => field.onChange(+event.target.value)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="quizQuestionDuration" render={({ field }) => (<FormItem><FormLabel>Duration per Question (seconds)</FormLabel><FormControl><Input type="number" placeholder="60" {...field} value={field.value ?? ''} onChange={event => field.onChange(+event.target.value)} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            )}
            
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create & Join'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}