"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AGE_RESTRICTIONS, CATEGORIES, LANGUAGES, POPULAR_CITIES, POPULAR_TAGS } from "@/convex/constants";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";
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
  name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  location: z.string().min(1, "Location is required"),
  city: z.string().min(1, "City is required"),
  category: z.string().min(1, "Category is required"),
  eventDate: z
    .number()
    .refine((t) => !isNaN(t) && t > 0, "Valid date is required"),
  price: z.number().min(0, "Price must be non‑negative"),
  totalTickets: z.number().min(1, "At least 1 ticket"),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string().max(30, "Each tag must be 30 characters or less")).max(10, "Maximum 10 tags allowed").optional(),
  language: z.string().min(1, "Language is required"),
  duration: z.object({
    hours: z.number().min(0).max(24, "Hours must be between 0 and 24"),
    minutes: z.number().min(0).max(59, "Minutes must be between 0 and 59"),
  }).optional(),
  ageRestriction: z.string().min(1, "Age restriction is required"),
  seatingPlanId: z.string().optional(),
  venueId: z.string().optional(),
  // For custom location/city when "Other" is selected
  customLocation: z.string().optional(),
  customCity: z.string().optional(),
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
    seatingPlanId?: Id<"seatingPlans">;
    venueId?: Id<"venues">;
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
  const generateEventSeats = useMutation(api.seating.generateEventSeats);
  const genUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateImage = useMutation(api.storage.updateEventImage);
  const deleteImage = useMutation(api.storage.deleteImage);

  // lists
  const myPlans = useQuery(api.seating.listSeatingPlans, { userId: user?.id ?? "" });
  const myVenues = useQuery(api.seating.listVenues, { userId: user?.id ?? "" });

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
      duration: initialData?.duration ? 
        (() => {
          // Parse existing duration string to hours/minutes object
          const match = initialData.duration.match(/(\d+)\s*hour[s]?\s*(\d+)\s*minute[s]?/i);
          if (match) {
            return { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
          }
          return { hours: 0, minutes: 0 };
        })() : 
        { hours: 0, minutes: 0 },
      ageRestriction: initialData?.ageRestriction || "",
      seatingPlanId: initialData?.seatingPlanId || "",
      venueId: initialData?.venueId || "",
      customLocation: "",
      customCity: "",
    },
  });

  // Watch seating plan selection for capacity calculation
  const selectedSeatingPlanId = form.watch("seatingPlanId");
  const seatingPlanCapacity = useQuery(
    api.seating.getSeatingPlanCapacity,
    selectedSeatingPlanId ? { seatingPlanId: selectedSeatingPlanId as Id<"seatingPlans"> } : "skip"
  );

  // Sync totalTickets with seating plan capacity
  useEffect(() => {
    if (seatingPlanCapacity?.totalCapacity) {
      form.setValue("totalTickets", seatingPlanCapacity.totalCapacity);
    }
  }, [seatingPlanCapacity, form]);

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
        
        // Handle custom location/city
        const finalLocation = values.location === "Other" ? values.customLocation : values.location;
        const finalCity = values.city === "Other" ? values.customCity : values.city;
        
        // Convert duration object to string
        const durationString = values.duration ? 
          `${values.duration.hours} hour${values.duration.hours !== 1 ? 's' : ''} ${values.duration.minutes} minute${values.duration.minutes !== 1 ? 's' : ''}` : 
          undefined;
        
        if (mode === "create") {
          eventId = await createEvent({
            name: values.name,
            description: values.description,
            location: finalLocation || values.location,
            city: finalCity || values.city,
            category: values.category,
            eventDate: values.eventDate,
            price: values.price,
            totalTickets: values.totalTickets,
            userId: user.id,
            isFeatured: values.isFeatured,
            tags: values.tags,
            language: values.language,
            duration: durationString,
            ageRestriction: values.ageRestriction,
            seatingPlanId: values.seatingPlanId ? (values.seatingPlanId as Id<"seatingPlans">) : undefined,
            venueId: values.venueId ? (values.venueId as Id<"venues">) : undefined,
          });
        } else {
          eventId = initialData!._id;
          await updateEvent({
            eventId,
            name: values.name,
            description: values.description,
            location: finalLocation || values.location,
            eventDate: values.eventDate,
            price: values.price,
            totalTickets: values.totalTickets,
            language: values.language,
            duration: durationString,
            ageRestriction: values.ageRestriction,
            seatingPlanId: values.seatingPlanId ? (values.seatingPlanId as Id<"seatingPlans">) : undefined,
            venueId: values.venueId ? (values.venueId as Id<"venues">) : undefined,
          });
        }

        // — attach image if any —
        if (imageId) {
          await updateImage({ eventId, storageId: imageId });
        }

        // — generate seats if seating plan is selected —
        if (values.seatingPlanId) {
          await generateEventSeats({ eventId });
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
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select location</option>
                        {POPULAR_CITIES.map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                        <option value="Other">Other (specify below)</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("location") === "Other" && (
                <FormField
                  control={form.control}
                  name="customLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter custom location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select city</option>
                          {POPULAR_CITIES.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                          <option value="Other">Other (specify below)</option>
                        </select>
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
                          {CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("city") === "Other" && (
                <FormField
                  control={form.control}
                  name="customCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter custom city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                          disabled={!!selectedSeatingPlanId}
                          className={selectedSeatingPlanId ? "bg-muted" : ""}
                        />
                      </FormControl>
                      {selectedSeatingPlanId && (
                        <p className="text-sm text-muted-foreground">
                          Auto-calculated from seating plan ({seatingPlanCapacity?.totalCapacity || 0} seats)
                        </p>
                      )}
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
                    <FormLabel>Tags (select up to 10)</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                        {POPULAR_TAGS.map((tag) => (
                          <label key={tag} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.value?.includes(tag) || false}
                              onChange={(e) => {
                                const currentTags = field.value || [];
                                if (e.target.checked) {
                                  if (currentTags.length < 10) {
                                    field.onChange([...currentTags, tag]);
                                  }
                                } else {
                                  field.onChange(currentTags.filter(t => t !== tag));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="capitalize">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {field.value?.length || 0}/10 tags selected
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Guide Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Event Guide</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select language</option>
                            {LANGUAGES.map((language) => (
                              <option key={language} value={language}>{language}</option>
                            ))}
                          </select>
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
                          <div className="flex gap-3 items-center flex-wrap">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="24"
                                placeholder="0"
                                value={field.value?.hours || ""}
                                onChange={(e) => {
                                  const hours = parseInt(e.target.value) || 0;
                                  field.onChange({ ...field.value, hours });
                                }}
                                className="w-14 h-10 text-center"
                              />
                              <span className="text-sm text-muted-foreground whitespace-nowrap">hrs</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="59"
                                placeholder="0"
                                value={field.value?.minutes || ""}
                                onChange={(e) => {
                                  const minutes = parseInt(e.target.value) || 0;
                                  field.onChange({ ...field.value, minutes });
                                }}
                                className="w-14 h-10 text-center"
                              />
                              <span className="text-sm text-muted-foreground whitespace-nowrap">min</span>
                            </div>
                          </div>
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
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select age restriction</option>
                            {AGE_RESTRICTIONS.map((restriction) => (
                              <option key={restriction} value={restriction}>{restriction}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Seating options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seating (optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="seatingPlanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seating Plan</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">No seating plan</option>
                            {(myPlans || []).map((p) => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="venueId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">No venue</option>
                            {(myVenues || []).map((v) => (
                              <option key={v._id} value={v._id}>{v.name}</option>
                            ))}
                          </select>
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
