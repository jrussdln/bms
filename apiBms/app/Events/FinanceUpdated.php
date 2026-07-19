<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FinanceUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $action, // 'created' | 'updated' | 'deleted'
        public readonly int $userId,
        public readonly int $recordId,
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('finance.' . $this->userId)];
    }

    public function broadcastAs(): string
    {
        return 'finance.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'recordId' => $this->recordId,
        ];
    }
}