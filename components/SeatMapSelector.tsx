"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

type SeatRef = { sectionId: string; row: string; seatNumber: string };

export default function SeatMapSelector({ eventId }: { eventId: Id<"events"> }) {
  const { user } = useUser();
  const [selected, setSelected] = useState<SeatRef[]>([]);
  const [holdUntil, setHoldUntil] = useState<number | null>(null);

  const seating = useQuery(api.seating.getEventSeating, { eventId });
  const activeHold = useQuery(api.seating.getActiveHold, { eventId, userId: user?.id ?? "" });
  // const holdSeats = useMutation(api.seating.holdSeats);
  const releaseHold = useMutation(api.seating.releaseHold);
  const confirmSeats = useMutation(api.seating.confirmSeats);

  const maxSeats = 6;

  useEffect(() => {
    if (activeHold) {
      setHoldUntil(activeHold.expiresAt);
    } else {
      setHoldUntil(null);
    }
  }, [activeHold]);

  const timeRemaining = useMemo(() => {
    if (!holdUntil) return null;
    const diff = Math.max(0, holdUntil - Date.now());
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, [holdUntil]);

  const toggleSeat = (ref: SeatRef) => {
    const exists = selected.find(
      (x) => x.sectionId === ref.sectionId && x.row === ref.row && x.seatNumber === ref.seatNumber
    );
    if (exists) {
      setSelected(selected.filter((x) => !(x.sectionId === ref.sectionId && x.row === ref.row && x.seatNumber === ref.seatNumber)));
    } else {
      if (selected.length >= maxSeats) return;
      setSelected([...selected, ref]);
    }
  };

  const onHold = async () => {
    if (!user) return;
    if (selected.length === 0) return;
    // const res = await holdSeats({ eventId, userId: user.id, seats: selected });
    // holdUntil will update from activeHold query once refetched
  };

  const onRelease = async () => {
    if (!activeHold?._id) return;
    await releaseHold({ holdId: activeHold._id });
  };

  const onConfirm = async () => {
    if (!user || !activeHold?._id) return;
    await confirmSeats({ holdId: activeHold._id, userId: user.id });
  };

  if (!seating) return null;

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Select your seats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {seating.sections.length === 0 ? (
          <div className="text-sm text-muted-foreground">No seating available.</div>
        ) : (
          seating.sections.map((section: { id: string; name: string; price: number; rows: { row: string; seats: { seatNumber: string; status: string }[] }[] }) => (
            <div key={section.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{section.name}</div>
                <div className="text-sm text-muted-foreground">₹{section.price.toFixed(0)}</div>
              </div>
              <div className="space-y-1">
                {section.rows.map((row: { row: string; seats: { seatNumber: string; status: string }[] }) => (
                  <div key={row.row} className="flex gap-1 flex-wrap">
                    <div className="w-10 text-xs text-muted-foreground">{row.row}</div>
                    {row.seats.map((seat: { seatNumber: string; status: string }) => {
                      const ref: SeatRef = { sectionId: section.id, row: row.row, seatNumber: seat.seatNumber };
                      const isSelected = !!selected.find((x) => x.sectionId === ref.sectionId && x.row === ref.row && x.seatNumber === ref.seatNumber);
                      const disabled = seat.status !== "available" && !isSelected;
                      
                      // Get seat color based on status
                      const getSeatColor = () => {
                        if (isSelected) return "bg-blue-500 text-white border-blue-500";
                        if (disabled) return "bg-gray-300 text-gray-500 border-gray-300";
                        return "bg-green-500 text-white border-green-500";
                      };
                      
                      return (
                        <button
                          key={`${row.row}-${seat.seatNumber}`}
                          onClick={() => toggleSeat(ref)}
                          disabled={disabled}
                          className={`px-2 py-1 text-xs rounded border ${getSeatColor()}`}
                          title={`${row.row}${seat.seatNumber} - ${seat.status}`}
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            <span>VIP</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded"></div>
            <span>Premium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>Standard</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Economy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Sold</span>
          </div>
        </div>

        {/* Selected Seats Summary */}
        {selected.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">Selected Seats ({selected.length})</div>
            <div className="space-y-1">
              {selected.map((seat, idx) => {
                const section = seating.sections.find((s: { id: string; name: string; price: number; rows: { row: string; seats: { seatNumber: string; status: string }[] }[] }) => s.id === seat.sectionId);
                return (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{section?.name} - {seat.row}{seat.seatNumber}</span>
                    <span className="font-medium">₹{section?.price || 0}</span>
                  </div>
                );
              })}
              <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                <span>Total:</span>
                <span>₹{selected.reduce((sum, seat) => {
                  const section = seating.sections.find((s: { id: string; name: string; price: number; rows: { row: string; seats: { seatNumber: string; status: string }[] }[] }) => s.id === seat.sectionId);
                  return sum + (section?.price || 0);
                }, 0)}</span>
              </div>
            </div>
          </div>
        )}

        {activeHold && (
          <div className="text-sm">Hold expires in: <span className="font-semibold">{timeRemaining}</span></div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {!activeHold && (
          <Button disabled={selected.length === 0} onClick={onHold} className="cursor-pointer">Hold seats</Button>
        )}
        {activeHold && (
          <>
            <Button variant="secondary" onClick={onRelease} className="cursor-pointer">Release</Button>
            <Button onClick={onConfirm} className="cursor-pointer">Confirm</Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}


