import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET() {
    const privateToken = process.env.API_SECRET_KEY; // Your private token
    if (!privateToken) {
        return NextResponse.json({ error: 'Server error: Missing private token' }, { status: 500 });
    }

    // Generate a public token (e.g., JWT)
    const publicToken = jwt.sign(
        { purpose: 'public-access' }, // Payload
        privateToken,                // Signing key (private token)
        { expiresIn: '1h' }          // Token expiration
    );

    return NextResponse.json({ publicToken });
}