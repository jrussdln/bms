<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('users', fn() => true);