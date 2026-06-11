<?php

namespace App\Http\Controllers\Api\Auth;

use App\Actions\Auth\RegisterUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request, RegisterUser $registerUser): JsonResponse
    {
        $user = $registerUser->handle($request->validated());

        event(new Registered($user));

        return response()->json([
            'data' => new UserResource($user),
            'token' => $user->createToken('api')->plainTextToken,
            'token_type' => 'Bearer',
        ], 201);
    }
}
