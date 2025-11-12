import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { UserPlus } from 'lucide-react';

interface AddClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: any; // Replace with your actual form type
  onSubmit: (data: any) => void; // Replace with your actual submit handler type
}

const AddClientDialog: React.FC<AddClientDialogProps> = ({
  isOpen,
  onOpenChange,
  form,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className=" max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col">
        <div className="border-b-2 pb-4 max-sm:p-4 max-sm:border-b-2">
          <DialogHeader>
            <DialogTitle className="max-sm:text-left">Add Client</DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto max-sm:pl-4 max-sm:pr-4 max-sm:pb-4 max-sm:pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Client Name <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter client name" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identifier"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Identifier <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter client identifier" 
                        {...field}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="homepageurl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Homepage URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Homepage URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center justify-center w-full">
                        <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              Click to upload or drag and drop
                            </p>
                          </div>
                          <Input 
                            id="dropzone-file" 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => field.onChange(e.target.files)} 
                          />
                        </label>
                        <div className="flex items-center mt-2">
                          <Button asChild variant="outline" size="sm">
                            <label htmlFor="dropzone-file">Select a file</label>
                          </Button>
                          <span className="ml-2 text-sm text-muted-foreground">or Drop file here</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
            </form>
          </Form>
        </div>
        <DialogFooter className="!justify-center gap-2 max-sm:flex-row max-sm:justify-center max-sm:pb-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;