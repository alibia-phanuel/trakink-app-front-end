/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/authContext"; // ✅ Import du contexte

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth(); // ✅ Hook du contexte

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await loginUser(data); // ✅ Appel direct au contexte
      toast.success("Connexion réussie !");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Une erreur est survenue. Veuillez réessayer.";
      toast.error(`Erreur de connexion : ${errorMessage}`);
    }
  };

  return (
    <div className="h-screen w-full flex" dir="ltr">
      <div className="bg-[url('/icone/bg.png')] bg-cover bg-center h-full w-1/2 max-md:hidden"></div>
      <div className="h-full w-1/2 flex justify-center items-center flex-col md:relative right-10 bg-white rounded-s-lg max-md:w-full">
        <div className="flex justify-center items-center flex-col md:relative right-[-20px] bottom-20">
          <Image
            src="/icone/login.png"
            width={113}
            height={113}
            alt="login screen"
            priority
          />
          <h1 className="text-[79px] max-md:text-[40px] text-[#cd7455] font-semibold">
            Connexion
          </h1>
          <p className="text-[27px] max-md:text-[20px] mb-4">
            Veuillez remplir les informations suivantes.
          </p>
        </div>
        <div className="flex justify-center items-center w-full md:relative right-[-20px] bottom-20">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 w-[80%]">
            <div className="mb-4 w-full">
              <label htmlFor="email" className="block mb-1 text-sm font-medium">
                Email
              </label>
              <Input
                className="bg-[#d9d9d9] h-[50px] w-full"
                type="email"
                placeholder="Entrez votre email..."
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mb-2 relative">
              <label
                htmlFor="password"
                className="block mb-1 text-sm font-medium"
              >
                Mot de passe
              </label>
              <Input
                className="bg-[#d9d9d9] h-[50px] w-full"
                type={showPassword ? "text" : "password"}
                placeholder="Entrez votre mot de passe..."
                {...register("password")}
              />
              <div
                className="absolute right-3 top-[50px] -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="text-left mb-6 text-sm">
              <a href="/forgot-password" className="text-blue-500 underline">
                Mot de passe oublié ?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#cd7455] hover:bg-[#b25f45] text-white cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion..." : "Continuer"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
