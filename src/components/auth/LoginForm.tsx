'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/lib/api';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginForm() {
  const { register, handleSubmit } = useForm();
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setAuth(data);
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error('Login Failed', { description: error.message });
    },
  });

  const onSubmit = (data: any) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email', { required: true })} placeholder="m@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password', { required: true })} />
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}