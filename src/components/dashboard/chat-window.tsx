'use client';

import { useState, useEffect, useRef } from 'react';
import { getChatMessages, sendChatMessage, markChatAsRead } from '@/app/dashboard/actions-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { RiSendPlane2Line, RiMessage3Line } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { getSocket } from '@/lib/socket-client';

interface ChatMessage {
  id: number;
  text: string;
  createdAt: Date;
  senderId: string;
  senderName: string;
  senderRole: string;
}

interface ChatWindowProps {
  teamId: number;
  teamName: string;
  projectName?: string;
  subtitle?: string;
}

export function ChatWindow({ teamId, teamName, projectName, subtitle }: ChatWindowProps) {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const [chatState, setChatState] = useState<{
    messages: ChatMessage[];
    loading: boolean;
  }>({
    messages: [],
    loading: true,
  });
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const onMessagesFetched = (msgs: ChatMessage[]) => {
    setChatState({ messages: msgs, loading: false });
    // Scroll to bottom immediately on first load
    setTimeout(() => scrollToBottom('auto'), 50);
  };

  const onFetchFailed = () => {
    setChatState((prev) => ({ ...prev, loading: false }));
  };

  const onMessageReceived = (newMessage: ChatMessage) => {
    setChatState((prev) => {
      // Prevent duplicate real database messages
      if (prev.messages.some((m) => m.id === newMessage.id)) return prev;

      // Replace/filter out matching optimistic message if any
      // Optimistic messages have id > 1000000000000 (Date.now())
      const filtered = prev.messages.filter(
        (m) =>
          !(
            m.senderId === newMessage.senderId &&
            m.id > 1000000000000 &&
            m.text === newMessage.text
          ),
      );

      return {
        ...prev,
        messages: [
          ...filtered,
          {
            ...newMessage,
            createdAt: new Date(newMessage.createdAt), // Parse to Date object
          },
        ],
      };
    });
  };

  // Core socket.io connection and real-time message handling
  useEffect(() => {
    let active = true;

    async function fetchMessages() {
      try {
        const msgs = await getChatMessages(teamId);
        if (active) {
          onMessagesFetched(msgs);
        }
      } catch (err) {
        console.error('Failed to fetch chat messages:', err);
        if (active) {
          onFetchFailed();
        }
      }
    }

    // Initial load
    fetchMessages();
    markChatAsRead(teamId).catch(() => {});

    // Setup Socket.IO
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_team', teamId);

    const handleMessage = (newMessage: ChatMessage) => {
      if (!active) return;
      onMessageReceived(newMessage);
      // Mark as read when receiving a message
      markChatAsRead(teamId).catch(() => {});
      setTimeout(() => scrollToBottom('smooth'), 10);
    };

    socket.on('message', handleMessage);

    // Backup polling/read-marking for read receipts (every 10 seconds)
    const readReceiptInterval = setInterval(() => {
      if (active) {
        markChatAsRead(teamId).catch(() => {});
      }
    }, 10000);

    return () => {
      active = false;
      socket.off('message', handleMessage);
      clearInterval(readReceiptInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  // Send message handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending || !currentUserId) return;

    // Optimistic UI update
    const optimisticMessage: ChatMessage = {
      id: Date.now(), // temporary local id
      text: trimmed,
      createdAt: new Date(),
      senderId: currentUserId,
      senderName: session?.user?.name || 'Me',
      senderRole: (session?.user as { role?: string })?.role || 'student',
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, optimisticMessage],
    }));
    setInputText('');
    setSending(true);
    setTimeout(() => scrollToBottom('smooth'), 10);

    try {
      await sendChatMessage(teamId, trimmed);
      setSending(false);
      setTimeout(() => scrollToBottom('smooth'), 10);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Rollback optimistic message if failed
      setChatState((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== optimisticMessage.id),
      }));
      setInputText(trimmed); // restore text
      setSending(false);
    }
  };

  return (
    <Card className="flex h-[calc(100vh-12rem)] min-h-[500px] w-full flex-col overflow-hidden border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Chat Header */}
      <CardHeader className="flex flex-row items-center gap-4 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:bg-purple-500/20">
          <RiMessage3Line className="size-5" />
        </div>
        <div className="flex-1 truncate">
          <h2 className="truncate text-base font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            {teamName}
          </h2>
          {projectName && (
            <p className="truncate text-xs font-bold text-zinc-400 uppercase dark:text-zinc-500">
              {projectName} {subtitle && `• ${subtitle}`}
            </p>
          )}
        </div>
      </CardHeader>

      {/* Chat Messages */}
      <CardContent
        className="flex-1 overflow-y-auto bg-zinc-50/30 p-6 dark:bg-zinc-950/30"
        ref={containerRef}
      >
        {chatState.loading ? (
          <div className="flex h-full w-full items-center justify-center">
            {/* Polished ellipsis character used */}
            <span className="animate-pulse text-xs font-black tracking-wider text-zinc-400 uppercase">
              Loading chat…
            </span>
          </div>
        ) : chatState.messages.length === 0 ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <RiMessage3Line className="size-8 text-zinc-300" />
            <p className="text-xs font-bold text-zinc-400 uppercase">No messages yet</p>
            <p className="text-[10px] text-zinc-400/80">Start the conversation below.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {chatState.messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              const isTeacher = msg.senderRole === 'professor' || msg.senderRole === 'jury';

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex max-w-[80%] items-end gap-3',
                    isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto',
                  )}
                >
                  {/* Sender Avatar */}
                  <Avatar className="size-7 border border-zinc-100 dark:border-zinc-800">
                    <AvatarFallback
                      className={cn(
                        'text-[10px] font-black uppercase',
                        isOwn
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
                          : isTeacher
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
                      )}
                    >
                      {msg.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Bubble Container */}
                  <div className="flex flex-col gap-1">
                    {!isOwn && (
                      <span className="px-1 text-[9px] font-bold text-zinc-400 uppercase">
                        {msg.senderName}{' '}
                        {isTeacher && (
                          <span className="ml-1 rounded bg-amber-500/10 px-1 py-0.5 text-[8px] font-black text-amber-600 dark:bg-amber-500/20">
                            Teacher
                          </span>
                        )}
                      </span>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm',
                        isOwn
                          ? 'rounded-br-none bg-purple-600 text-white dark:bg-purple-700'
                          : 'rounded-bl-none border border-zinc-100 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100',
                      )}
                    >
                      <p className="break-words whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span
                      className={cn(
                        'px-1 text-[8px] text-zinc-400/80',
                        isOwn ? 'text-right' : 'text-left',
                      )}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Chat Footer/Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 border-t border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <Input
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={sending}
          className="flex-1 border-zinc-200 focus-visible:ring-purple-500 dark:border-zinc-800"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!inputText.trim() || sending}
          className="shrink-0 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
        >
          <RiSendPlane2Line className="size-4 text-white" data-icon="inline-start" />
        </Button>
      </form>
    </Card>
  );
}
