import EventForm from "@/components/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className=" rounded-lg shadow-lg overflow-hidden">
        <div className=" px-6 py-8">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <p className="text-blue-100 mt-2">
            List your event and start selling tickets
          </p>
        </div>

        <div className="p-6">
          <EventForm mode="create" />
        </div>
      </div>
    </div>
  );
}
