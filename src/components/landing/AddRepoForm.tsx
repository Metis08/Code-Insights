'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  repoUrl: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  zipFile: z.instanceof(File).optional(),
}).refine(data => !!data.repoUrl || !!data.zipFile, {
  message: 'Please provide a repository URL or a zip file.',
  path: ['repoUrl'],
});

export function AddRepoForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.repoUrl) {
      router.push(`/analyze?repoUrl=${encodeURIComponent(values.repoUrl)}&analyze=true`);
    } else if (values.zipFile) {
      // Handle zip file upload logic here
      console.log('Zip file to upload:', values.zipFile);
      // For now, we'll just log it. A real implementation would
      // upload the file and then redirect to the analysis page.
    }
  }

  return (
    <Tabs defaultValue="url" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="url"><Link className="mr-2 h-4 w-4" />From URL</TabsTrigger>
        <TabsTrigger value="zip"><UploadCloud className="mr-2 h-4 w-4" />Upload .zip</TabsTrigger>
      </TabsList>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
          <TabsContent value="url">
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/user/project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </TabsContent>
          <TabsContent value="zip">
              <FormField
                control={form.control}
                name="zipFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repository .zip file</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept=".zip"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </TabsContent>
          <Button type="submit" className="w-full">Analyze Repository</Button>
        </form>
      </Form>
    </Tabs>
  );
}
