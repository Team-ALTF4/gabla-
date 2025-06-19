'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { registerUser } from '@/lib/api';
import { toast } from 'sonner';

export default function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register, handleSubmit } = useForm();
  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Registration successful!', { description: 'Please log in with your new account.' });
      onSwitch(); // Switch to login form
    },
    onError: (error) => {
      toast.error('Registration failed', { description: error.message });
    },
  });

  const onSubmit = (data: any) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email', { required: true })} placeholder="m@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password', { required: true })} />
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Registering...' : 'Create an account'}
      </Button>
    </form>
  );
}