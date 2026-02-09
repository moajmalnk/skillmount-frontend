import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface UseVoiceRecorderProps {
    onRecordingComplete?: (blob: Blob) => void;
}

export const useVoiceRecorder = ({ onRecordingComplete }: UseVoiceRecorderProps = {}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [permissionError, setPermissionError] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            stopCleanup();
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const stopCleanup = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const getSupportedMimeType = () => {
        const types = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/mp4",
            "audio/ogg",
            "audio/wav"
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) return type;
        }
        return "";
    };

    const startRecording = async () => {
        if (isInitializing) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error("Browser does not support audio recording.");
            return;
        }

        setIsInitializing(true);
        setPermissionError(false);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mimeType = getSupportedMimeType();
            const options = mimeType ? { mimeType } : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const actualMimeType = mediaRecorder.mimeType || mimeType || "audio/webm";
                const blob = new Blob(audioChunksRef.current, { type: actualMimeType });

                if (blob.size > 0) {
                    const url = URL.createObjectURL(blob);
                    setAudioUrl(url);
                    setAudioBlob(blob);
                    if (onRecordingComplete) onRecordingComplete(blob);
                }
                stopCleanup();
            };

            mediaRecorder.start(1000);
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 60) {
                        stopRecording();
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (error: any) {
            console.error("Recording error:", error);
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setPermissionError(true);
                toast.error("Microphone access denied.");
            } else {
                toast.error("Could not start recording.");
            }
        } finally {
            setIsInitializing(false);
        }
    };

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, []);

    const cancelRecording = useCallback(() => {
        stopRecording();
        setAudioUrl(null);
        setAudioBlob(null);
        setRecordingTime(0);
    }, [stopRecording]);

    const resetRecording = useCallback(() => {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setAudioBlob(null);
        setRecordingTime(0);
    }, [audioUrl]);

    return {
        isRecording,
        recordingTime,
        audioUrl,
        audioBlob,
        isInitializing,
        permissionError,
        startRecording,
        stopRecording,
        cancelRecording, // Stops and clears
        resetRecording,  // Clears existing recording
        formatTime: (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };
};
