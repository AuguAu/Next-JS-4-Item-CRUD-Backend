import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";

const responseHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store"
};

export async function OPTIONS() {
    return new Response(null, { status: 200, headers: responseHeaders });
}

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const client = await getClientPromise();
        const result = await client.db("wad-01").collection("user").findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } }
        );
        return NextResponse.json(result, { headers: responseHeaders });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500, headers: responseHeaders });
    }
}

export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { _id, ...updateData } = body; 

        const client = await getClientPromise();

        if (updateData.password && updateData.password.trim() !== "") {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password;
        }

        await client.db("wad-01").collection("user").updateOne(
            { _id: new ObjectId(id) }, 
            { $set: updateData }
        );

        return NextResponse.json({ success: true }, { headers: responseHeaders });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500, headers: responseHeaders });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const client = await getClientPromise();
        
        const result = await client.db("wad-01").collection("user").deleteOne({ 
            _id: new ObjectId(id) 
        });

        if (result.deletedCount === 1) {
            return NextResponse.json({ success: true }, { headers: responseHeaders });
        } else {
            return NextResponse.json({ error: "User not found" }, { status: 404, headers: responseHeaders });
        }
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500, headers: responseHeaders });
    }
}