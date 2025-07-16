"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { FaCamera } from "react-icons/fa6";
import Loading from "../Loading/Loading";
import { toast } from "sonner";
import { useAuth } from "@/src/hooks/useAuth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/src/lib/firebase";
import { updateUserProfile } from "@/src/services/authServices";

const PfpUploader = ({ pfpUrl }: { pfpUrl: string }) => {
  const [loading, setLoading] = useState(false);
  const {user} = useAuth();

  const updateProfilePic = async (imageFile: File | Blob): Promise<void> => {
    try {
        setLoading(true)
        const storageRef = ref(storage, `uploads/${user?.userId}`);
        await uploadBytes(storageRef, imageFile)
        const pfpUrl = await getDownloadURL(storageRef);
        await updateUserProfile({userId: user!.userId, pfpUrl})
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleImageCapture = async () => {
    try {
      if (Capacitor.getPlatform() === "web") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async (event) => {
          const target = event.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              toast.error("File size must be less than 5MB");
              return;
            }
            if (!file.type.startsWith("image/")) {
              toast.error("Please select a valid image file");
              return;
            }
            await updateProfilePic(file);
          }
        };
        input.click();
      } else if (Capacitor.getPlatform() === "android") {
        const image = (await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt, // Shows both camera and gallery options
          promptLabelHeader: "Profile Picture",
          promptLabelPhoto: "Choose from Gallery",
          promptLabelPicture: "Take New Photo",
        })) as Photo & { dataUrl: string };
        if (image === undefined) {
          toast.error("Please select an image");
          return;
        }
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        await updateProfilePic(blob);
      }
    } catch (e) {
      toast.error("Some error occured");
      console.error(e);
      throw e;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="relative">
      <div className="h-24 w-24 overflow-hidden rounded-full">
        <Image width={100} height={100} alt="Profile Picture" src={pfpUrl} />
      </div>
      <button
        onClick={() => {
          handleImageCapture();
        }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 transform"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6c5ce7]">
          <FaCamera className="h-5 w-5 text-white" />
        </div>
      </button>
    </div>
  );
};

export default PfpUploader;
