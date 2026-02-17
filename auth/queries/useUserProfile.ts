import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./authKeys";
import { authDomainInterface } from "../interface/AuthDomainInterface";
import type { AuthSession } from "../types";
import { supabaseUrl } from "../../shared/supabase";

export const useUserProfileQuery = (session: AuthSession | null) => {
    const queryClient = useQueryClient();
    const lastAvatarSeedRef = useRef<string | null>(null);

    const buildDefaultAvatar = (userId: string) =>
        `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(
            userId,
        )}`;

    const normalizeAvatarUrl = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) {
            return { normalized: "", changed: false };
        }

        const publicSegment = "/storage/v1/object/public/";
        const objectSegment = "/storage/v1/object/";
        const normalizeDoublePublic = (value: string) =>
            value.includes(`${publicSegment}public/`)
                ? value.replace(`${publicSegment}public/`, publicSegment)
                : value;

        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            const normalizedInput = normalizeDoublePublic(trimmed);
            if (
                normalizedInput.includes(objectSegment) &&
                !normalizedInput.includes(publicSegment)
            ) {
                return {
                    normalized: normalizedInput.replace(
                        objectSegment,
                        publicSegment,
                    ),
                    changed: true,
                };
            }
            return { normalized: normalizedInput, changed: normalizedInput !== trimmed };
        }

        if (trimmed.startsWith(objectSegment)) {
            const normalized = `${supabaseUrl}${trimmed.replace(
                objectSegment,
                publicSegment,
            )}`;
            return { normalized: normalizeDoublePublic(normalized), changed: true };
        }

        if (trimmed.startsWith("user-avatars/")) {
            return {
                normalized: normalizeDoublePublic(
                    `${supabaseUrl}${publicSegment}${trimmed}`,
                ),
                changed: true,
            };
        }

        const normalized = normalizeDoublePublic(trimmed);
        return { normalized, changed: normalized !== trimmed };
    };

    useEffect(() => {
        queryClient.setQueryData(
            authKeys.profile(),
            authDomainInterface.parseUserProfile(session),
        );
    }, [queryClient, session]);

    useEffect(() => {
        const userId = session?.user?.id ?? null;
        if (!userId) {
            lastAvatarSeedRef.current = null;
            return;
        }

        const metadata =
            (session?.user?.user_metadata as Record<string, unknown> | null) ??
            {};
        const avatar =
            typeof metadata.avatar === "string" ? metadata.avatar : "";
        const { normalized, changed } = normalizeAvatarUrl(avatar);

        if (normalized) {
            if (!changed) {
                lastAvatarSeedRef.current = userId;
                return;
            }

            if (lastAvatarSeedRef.current === userId) {
                return;
            }

            lastAvatarSeedRef.current = userId;
            void authDomainInterface
                .updateUser({ avatar: normalized })
                .then(() => {
                    const previous =
                        queryClient.getQueryData<{
                            name: string;
                            role: string;
                            avatar: string;
                        }>(authKeys.profile()) ??
                        authDomainInterface.parseUserProfile(session);
                    if (!previous) {
                        return;
                    }
                    queryClient.setQueryData(authKeys.profile(), {
                        ...previous,
                        avatar: normalized,
                    });
                })
                .catch(() => {
                    lastAvatarSeedRef.current = null;
                });
            return;
        }

        if (lastAvatarSeedRef.current === userId) {
            return;
        }

        const defaultAvatar = buildDefaultAvatar(userId);
        lastAvatarSeedRef.current = userId;
        void authDomainInterface
            .updateUser({ avatar: defaultAvatar })
            .then(() => {
                const previous =
                    queryClient.getQueryData<{
                        name: string;
                        role: string;
                        avatar: string;
                    }>(authKeys.profile()) ??
                    authDomainInterface.parseUserProfile(session);
                if (!previous) {
                    return;
                }
                queryClient.setQueryData(authKeys.profile(), {
                    ...previous,
                    avatar: defaultAvatar,
                });
            })
            .catch(() => {
                lastAvatarSeedRef.current = null;
            });
    }, [queryClient, session]);

    return useQuery({
        queryKey: authKeys.profile(),
        queryFn: () => authDomainInterface.parseUserProfile(session),
        initialData: authDomainInterface.parseUserProfile(session),
        staleTime: Infinity,
    });
};
