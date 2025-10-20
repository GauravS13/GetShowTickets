"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ——— VALIDATION SCHEMA ———
// Now eventDate is a number (ms since epoch)
const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  category: z.string().min(1, "Category is required"),
  eventDate: z
    .number()
    .refine((t) => !isNaN(t) && t > 0, "Valid date is required"),
  price: z.number().min(0, "Price must be non‑negative"),
  totalTickets: z.number().min(1, "At least 1 ticket"),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
  duration: z.string().optional(),
  ageRestriction: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: {
    _id: Id<"events">;
    name: string;
    description: string;
    location: string;
    city: string;
    category: string;
    eventDate: number;
    price: number;
    totalTickets: number;
    imageStorageId?: Id<"_storage">;
    isFeatured?: boolean;
    tags?: string[];
    language?: string;
    duration?: string;
    ageRestriction?: string;
  };
}

export default function EventForm({ mode, initialData }: EventFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.imageStorageId ? "/path/to/image" : null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // mutations
  const createEvent = useMutation(api.events.create);
  const updateEvent = useMutation(api.events.updateEvent);
  const genUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateImage = useMutation(api.storage.updateEventImage);
  const deleteImage = useMutation(api.storage.deleteImage);

  // ——— SET UP FORM ———
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      city: initialData?.city || "",
      category: initialData?.category || "",
      // now a number
      eventDate: initialData?.eventDate || Date.now(),
      price: initialData?.price || 0,
      totalTickets: initialData?.totalTickets || 1,
      isFeatured: initialData?.isFeatured || false,
      tags: initialData?.tags || [],
      language: initialData?.language || "",
      duration: initialData?.duration || "",
      ageRestriction: initialData?.ageRestriction || "",
    },
  });

  async function onSubmit(values: EventFormValues) {
    if (!user?.id) return;
    startTransition(async () => {
      try {
        let imageId = initialData?.imageStorageId || null;

        // — upload new image if selected —
        if (selectedFile) {
          const uploadUrl = await genUploadUrl();
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": selectedFile.type },
            body: selectedFile,
          });
          const { storageId } = await res.json();
          imageId = storageId;
        }

        // — delete old image if needed —
        if (
          mode === "edit" &&
          initialData?.imageStorageId &&
          imageId !== initialData.imageStorageId
        ) {
          await deleteImage({ storageId: initialData.imageStorageId });
        }

        // — create or update event record —
        let eventId: Id<"events">;
        if (mode === "create") {
          eventId = await createEvent({
            ...values,
            userId: user.id,
          });
        } else {
          eventId = initialData!._id;
          await updateEvent({
            eventId,
            ...values,
          });
        }

        // — attach image if any —
        if (imageId) {
          await updateImage({ eventId, storageId: imageId });
        }

        toast.success(mode === "create" ? "Event created" : "Event updated");
        router.push(`/event/${eventId}`);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
      }
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Create Event" : "Edit Event"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Fill out the form to create a new event"
            : "Update your event details"}
        </CardDescription>
      </CardHeader>

      {/* — attach onSubmit here and remove nested form tag — */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* — left column — */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="My Awesome Event" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Venue, Address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="New York" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select category</option>
                          <option value="comedy">Comedy</option>
                          <option value="music">Music</option>
                          <option value="sports">Sports</option>
                          <option value="theater">Theater</option>
                          <option value="activities">Activities</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* — date picker popover — */}
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(new Date(field.value), "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={new Date(field.value)}
                              onSelect={(date) =>
                                field.onChange(date?.getTime() ?? Date.now())
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="totalTickets"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Total Tickets</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-medium">
                        Featured Event
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value?.join(", ") || ""}
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(",")
                            .map(tag => tag.trim())
                            .filter(tag => tag.length > 0);
                          field.onChange(tags);
                        }}
                        placeholder="comedy, live, weekend"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Guide Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Guide</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="English, Hindi" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1 Hour 30 Minutes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ageRestriction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Restriction</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="18 yrs & above" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* — right column (image upload) — */}
            <div className="space-y-4">
              <FormLabel>Event Image</FormLabel>
              <div className="relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
                {previewUrl ? (
                  <div className="relative w-full h-48 rounded-md overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Drag & drop or click to upload
                  </p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </CardContent>

          <Separator />

          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === "create" ? "Create Event" : "Update Event"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
