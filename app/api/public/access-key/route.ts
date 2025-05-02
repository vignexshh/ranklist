// api/public/access-key
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs'; // Import file system module if writing to a file

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

    // Log the token to the console
    // console.log(`Generated Public Token: ${publicToken}`);

    // Optionally, write the token to a file (e.g., .env)
    fs.writeFileSync('.env.public', `PUBLIC_TOKEN=${publicToken}\n`, { flag: 'w' });

    return NextResponse.json({ publicToken });
}