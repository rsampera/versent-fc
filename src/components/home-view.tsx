"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { PitchBoard, PitchMarker } from "@/components/pitch-board";
import { PlayerCard } from "@/components/player-card";
import { PlayerEditModal } from "@/components/player-edit-modal";
import { PlayerStrip } from "@/components/player-strip";
import {
  LineupSlot,
  LineupVariant,
  Player,
  PlayerPreference,
  getPitchJerseySrc,
} from "@/lib/site-data";

type HomeViewProps = {
  initialVariant?: string;
  lineupVariants: LineupVariant[];
  managerToken?: string;
  players: Player[];
  showPlayerStrip?: boolean;
};

function cloneSlots(slots: LineupSlot[]) {
  return slots.map((slot) => ({ ...slot }));
}

function slotsMatch(left: LineupSlot[], right: LineupSlot[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((slot, index) => {
    const other = right[index];

    return (
      slot.playerId === other?.playerId &&
      slot.x === other?.x &&
      slot.y === other?.y
    );
  });
}

export function HomeView({
  initialVariant,
  lineupVariants,
  managerToken,
  players,
  showPlayerStrip = true,
}: HomeViewProps) {
  const fallbackVariantId =
    initialVariant ??
    lineupVariants.find((variant) => variant.isActive)?.id ??
    lineupVariants[0]?.id ??
    "";

  const activeVariant =
    lineupVariants.find((variant) => variant.id === fallbackVariantId) ??
    lineupVariants[0];

  const [playerState, setPlayerState] = useState(players);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isManagerMode, setIsManagerMode] = useState(false);
  const [playerSaveMessage, setPlayerSaveMessage] = useState<string | null>(null);
  const [managerMessage, setManagerMessage] = useState<string | null>(null);
  const [savedSlots, setSavedSlots] = useState(() => cloneSlots(activeVariant.slots));
  const [draftSlots, setDraftSlots] = useState(() => cloneSlots(activeVariant.slots));
  const [isPlayerPending, startPlayerTransition] = useTransition();
  const [isManagerPending, startManagerTransition] = useTransition();

  useEffect(() => {
    setPlayerState(players);
  }, [players]);

  useEffect(() => {
    const nextSlots = cloneSlots(activeVariant.slots);
    setSavedSlots(nextSlots);
    setDraftSlots(nextSlots);
  }, [activeVariant.id, activeVariant.slots]);

  const playersById = useMemo(
    () => new Map(playerState.map((player) => [player.id, player])),
    [playerState],
  );

  const selectedPlayer = selectedPlayerId
    ? playersById.get(selectedPlayerId) ?? null
    : null;
  const starterIds = new Set(draftSlots.map((slot) => slot.playerId));
  const hasUnsavedManagerChanges = !slotsMatch(savedSlots, draftSlots);

  const activeMarkers: PitchMarker[] = draftSlots.reduce<PitchMarker[]>(
    (markers, slot) => {
      const player = playersById.get(slot.playerId);

      if (!player) {
        return markers;
      }

      markers.push({
        id: slot.playerId,
        label: player.name.split(" ")[0],
        shirtNumber: player.shirtNumber,
        jerseySrc: getPitchJerseySrc(player),
        x: slot.x,
        y: slot.y,
        accent: selectedPlayerId === slot.playerId ? "white" : "lime",
      });

      return markers;
    },
    [],
  );

  function handleManagerToggle() {
    if (isManagerMode) {
      if (hasUnsavedManagerChanges) {
        setDraftSlots(cloneSlots(savedSlots));
        setManagerMessage("Discarded unsaved layout changes.");
      }

      setIsManagerMode(false);
      return;
    }

    setManagerMessage(null);
    setPlayerSaveMessage(null);
    setIsPlayerModalOpen(false);
    setIsManagerMode(true);
    setSelectedPlayerId((current) => current ?? draftSlots[0]?.playerId ?? null);
  }

  function handlePlayerSave(preference: PlayerPreference) {
    if (!selectedPlayer) {
      return;
    }

    startPlayerTransition(async () => {
      setPlayerSaveMessage(null);

      const response = await fetch(`/api/player/${selectedPlayer.editToken}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preference,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPlayerSaveMessage(payload.error ?? "Unable to save player.");
        return;
      }

      setPlayerState((current) =>
        current.map((player) =>
          player.id === selectedPlayer.id ? { ...player, preference } : player,
        ),
      );
      setPlayerSaveMessage("Player saved.");
      setIsPlayerModalOpen(false);
    });
  }

  function handleManagerSave() {
    if (!managerToken) {
      return;
    }

    startManagerTransition(async () => {
      setManagerMessage(null);

      const response = await fetch(
        `/api/manage/${managerToken}/lineups/${activeVariant.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            slots: draftSlots,
          }),
        },
      );

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setManagerMessage(payload.error ?? "Unable to save layout.");
        return;
      }

      setSavedSlots(cloneSlots(draftSlots));
      setManagerMessage("Layout saved.");
      setIsManagerMode(false);
    });
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-[1.65rem] bg-[linear-gradient(180deg,rgba(8,14,11,0.95),rgba(4,8,6,0.94))] px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="rounded-[1rem] bg-[#09110c] px-3.5 py-2.5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[#a6ff47]">
                Club
              </p>
              <h1 className="mt-1 text-xl font-black uppercase tracking-[0.08em] text-white sm:text-2xl">
                VERSENT FC
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {selectedPlayer && !isManagerMode ? (
                <button
                  className="rounded-full border border-white/10 bg-black/18 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white/82 transition hover:border-white/22 hover:bg-white/[0.06]"
                  onClick={() => {
                    setPlayerSaveMessage(null);
                    setIsPlayerModalOpen(true);
                  }}
                  type="button"
                >
                  Edit Player
                </button>
              ) : null}
              {managerToken ? (
                <button
                  className={`rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] transition ${
                    isManagerMode
                      ? "border-[#a6ff47]/45 bg-[#a6ff47] text-[#081108]"
                      : "border-[#a6ff47]/35 bg-[#a6ff47]/12 text-[#efffcf] hover:border-[#a6ff47]/48 hover:bg-[#a6ff47]/18"
                  }`}
                  onClick={handleManagerToggle}
                  type="button"
                >
                  {isManagerMode ? "Exit Manager" : "Manager Mode"}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_28.5rem] xl:items-start">
          <section className="min-w-0 space-y-3">
            <PitchBoard
              interactive={isManagerMode}
              markers={activeMarkers}
              onMarkerClick={(playerId) => {
                setSelectedPlayerId((current) => {
                  if (isManagerMode) {
                    return playerId;
                  }

                  return current === playerId ? null : playerId;
                });
              }}
              onMarkerMove={(markerId, x, y) => {
                if (!isManagerMode) {
                  return;
                }

                setDraftSlots((current) =>
                  current.map((slot) =>
                    slot.playerId === markerId ? { ...slot, x, y } : slot,
                  ),
                );
              }}
              selectedMarkerId={selectedPlayerId ?? undefined}
            />
          </section>

          <aside className="min-w-0 rounded-[1.75rem] bg-[#09110c]/85 p-3.5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] xl:sticky xl:top-6 xl:h-fit">
            {isManagerMode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#a6ff47]">
                    Manager Mode
                  </p>
                  <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white">
                    Adjust Lineup
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/58">
                    Drag any jersey on the pitch to reposition the starting eight.
                    Save when the layout is right, or discard to return to the last
                    saved setup.
                  </p>
                </div>

                {selectedPlayer ? (
                  <div className="rounded-[1.5rem] border border-white/8 bg-black/20 px-4 py-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#a6ff47]">
                      Selected Player
                    </p>
                    <p className="mt-3 text-xl font-black uppercase tracking-[0.08em] text-white">
                      {selectedPlayer.name}
                    </p>
                    <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/52">
                      #{selectedPlayer.shirtNumber} · {selectedPlayer.preference.primaryPosition}
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                  <button
                    className="rounded-full border border-[#a6ff47]/42 bg-[#a6ff47] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-[#081108] transition hover:bg-[#baff6c] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isManagerPending}
                    onClick={handleManagerSave}
                    type="button"
                  >
                    {isManagerPending ? "Saving..." : "Save Layout"}
                  </button>
                  <button
                    className="rounded-full border border-white/10 bg-black/18 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white/78 transition hover:border-white/20 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasUnsavedManagerChanges}
                    onClick={() => {
                      setDraftSlots(cloneSlots(savedSlots));
                      setManagerMessage("Changes discarded.");
                    }}
                    type="button"
                  >
                    Discard
                  </button>
                </div>

                <p className="text-sm text-white/55">
                  {managerMessage ??
                    (hasUnsavedManagerChanges
                      ? "You have unsaved lineup changes."
                      : "No unsaved lineup changes.")}
                </p>
              </div>
            ) : selectedPlayer ? (
              <PlayerCard compact player={selectedPlayer} />
            ) : (
              <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[1.6rem] bg-black/14 px-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#a6ff47]">
                  No Player Selected
                </p>
                <h2 className="mt-3 text-2xl font-black uppercase tracking-[0.08em] text-white">
                  Choose A Jersey
                </h2>
                <p className="mt-4 max-w-xs text-sm leading-6 text-white/58">
                  Click any player on the field to bring their card into focus.
                </p>
              </div>
            )}
          </aside>
        </div>

        {showPlayerStrip ? (
          <PlayerStrip
            activePlayerId={selectedPlayerId}
            onSelect={(playerId) =>
              setSelectedPlayerId((current) => (current === playerId ? null : playerId))
            }
            players={playerState}
            starterIds={starterIds}
          />
        ) : null}
      </div>

      {selectedPlayer && isPlayerModalOpen ? (
        <PlayerEditModal
          isPending={isPlayerPending}
          onClose={() => setIsPlayerModalOpen(false)}
          onSave={handlePlayerSave}
          player={selectedPlayer}
          saveMessage={playerSaveMessage}
        />
      ) : null}
    </>
  );
}
