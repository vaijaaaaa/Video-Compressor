import { v2 as cloudinary } from 'cloudinary';
import { NextRequest,NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { error } from 'console';
import { rejects } from 'assert';
import { Result } from 'postcss';



// Configuration
cloudinary.config({ 
    cloud_name: 'process.env.NEXT_PUBLIC_CLOUNDINARY_CLOUD_NAME', 
    api_key: 'process.env.CLOUNDINARY_API_KEY', 
    api_secret: 'process.env.CLOUNDINARY_API_SECRECT' // Click 'View API Keys' above to copy your API secret
});



interface CloudinaryUploadResult{
    public_id:string;
    [key:string]:any
}


export async function POST(request:NextRequest) {
    const {userId} =  await auth()

    if(!userId){
        return NextResponse.json({error:"Unauthorized"},{status:401})
    }
    try {
        const formData = await request.formData()
        const file = formData.get("file") as File | null;

        if(!file){
            return NextResponse.json({error:"File not found"},{status:400})
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        
       const result = await new Promise<CloudinaryUploadResult> (
            (reslove,reject) =>{
               const uploadStream = cloudinary.uploader.upload_stream(
                {folder:"next-cloundinary-uploads"},
                (error,result) =>{
                    if(error) reject(error);
                    else reslove(result as CloudinaryUploadResult)
                }
            )
            uploadStream.end(buffer)
            }
        )

        return NextResponse.json({publicId:result.public_id},{status:400})


    } catch (error) {
        console.log("Upload image failed",error);
        return NextResponse.json({error:"Upload image failed"},{status:500})
    }
    
}


