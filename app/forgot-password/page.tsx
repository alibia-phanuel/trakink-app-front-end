/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  requestPasswordReset,
  verifyOtp,
  resetPasswordWithToken,
} from "@/lib/authApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
// === VALIDATIONS ===
const emailSchema = z.object({
  email: z.string().email("Email invalide"),
});
const otpSchema = z.object({
  otp: z
    .array(z.string().regex(/^\d$/, "Un seul chiffre"))
    .length(6, "Code OTP incomplet"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "6 caractères minimum"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// === COMPOSANT PRINCIPAL ===
export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
   const router = useRouter();
  // Step 1 - Form Email
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const handleEmail = async (data: any) => {
    const { success, message } = await requestPasswordReset(data.email);
    if (success) {
      setEmail(data.email);
      setStep(2);
    } else {
      alert(message);
    }
  };

  // Step 2 - Form OTP
  const {
    control: controlOtp,
    handleSubmit: handleOtpSubmit,
    setValue: setOtpValue,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: Array(6).fill("") },
  });

  const handleOtpChange = (value: string, index: number) => {
    if (/^\d$/.test(value)) {
      setOtpValue(`otp.${index}`, value);
      if (index < 5) inputsRef.current[index + 1]?.focus();
    } else if (value === "") {
      setOtpValue(`otp.${index}`, "");
    }
  };

  const handleOtp = async (data: any) => {
    const otp = data.otp.join("");
    const response = await verifyOtp(email, otp);
    console.log("Réponse OTP:", response);

    if (response.success) {
      setResetToken(response.token); // stocke le token dans le state
      console.log("Token reçu et stocké :", response.token);
      setStep(3); // passe à l'étape suivante
    } else {
      toast.info(response.message); // affiche un message d'erreur si échec
    }
  };
  // Step 3 - Form Password
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handlePassword = async (data: any) => {
    if (!resetToken) {
      toast.info("Token manquant. Veuillez recommencer la procédure.");
      setStep(1);
      return;
    }

    const response = await resetPasswordWithToken(resetToken, data.password);
    if (response.success) {
      toast.success("Mot de passe modifié avec succès !");

      router.push("/login");
    } else {
      toast.info(response.message);
    }
  };

  // === UI PAR ÉTAPE ===
  return (
    <div className="bg-[#cd7455] h-screen w-full p-4 flex justify-center items-center">
      <div className="bg-white flex flex-col items-center border border-gray-200 p-4 rounded-lg shadow md:w-[40%] w-full max-w-full">
        {/* Étape 1 - Email */}
        {step === 1 && (
          <>
            <Image
              src="/icone/forgot.png"
              width={113}
              height={113}
              alt="forgot"
            />
            <h1 className="text-[40px] text-[#cd7455] font-semibold text-center">
              Mot de passe oublié
            </h1>
            <p className="text-center mb-4">
              Entrez votre email pour recevoir un code OTP.
            </p>
            <form
              onSubmit={handleEmailSubmit(handleEmail)}
              className="w-full space-y-4"
            >
              <Input {...registerEmail("email")} placeholder="Votre email" />
              {emailErrors.email && (
                <p className="text-red-500 text-sm">
                  {emailErrors.email.message}
                </p>
              )}
              <Button type="submit" className="w-full bg-[#cd7455] text-white">
                Envoyer le code
              </Button>
            </form>
          </>
        )}

        {/* Étape 2 - OTP */}
        {step === 2 && (
          <>
            <Image src="/icone/otp.png" width={113} height={113} alt="otp" />
            <h1 className="text-[40px] text-[#cd7455] font-semibold text-center">
              Vérification OTP
            </h1>
            <p className="text-center mb-4">
              Entrez le code à 6 chiffres reçu sur {email}
            </p>
            <form
              onSubmit={handleOtpSubmit(handleOtp)}
              className="flex flex-col gap-4 w-full items-center"
            >
              <div className="flex gap-2 justify-center">
                {Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <Controller
                      key={index}
                      control={controlOtp}
                      name={`otp.${index}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          inputMode="numeric"
                          maxLength={1}
                          className="text-center text-xl font-semibold w-12 h-14"
                          ref={(el) => {
                            inputsRef.current[index] = el;
                          }}
                          onChange={(e) =>
                            handleOtpChange(e.target.value, index)
                          }
                        />
                      )}
                    />
                  ))}
              </div>
              {otpErrors.otp && (
                <p className="text-red-500 text-sm">{otpErrors.otp.message}</p>
              )}
              <Button type="submit" className="w-full bg-[#cd7455] text-white">
                Vérifier
              </Button>
            </form>
          </>
        )}

        {/* Étape 3 - Nouveau mot de passe */}
        {step === 3 && (
          <>
            <Image
              src="/icone/forgot.png"
              width={113}
              height={113}
              alt="password"
            />
            <h1 className="text-[40px] text-[#cd7455] font-semibold text-center">
              Nouveau mot de passe
            </h1>
            <p className="text-center mb-4">
              Choisissez un nouveau mot de passe pour {email}
            </p>
            <form
              onSubmit={handlePasswordSubmit(handlePassword)}
              className="w-full space-y-4"
            >
              <Input
                {...registerPassword("password")}
                placeholder="Nouveau mot de passe"
                type={showPassword ? "text" : "password"}
              />
              {passwordErrors.password && (
                <p className="text-red-500 text-sm">
                  {passwordErrors.password.message}
                </p>
              )}

              <Input
                {...registerPassword("confirmPassword")}
                placeholder="Confirmez le mot de passe"
                type={showPassword ? "text" : "password"}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}

              <div
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer text-sm text-gray-600"
              >
                {showPassword ? "Cacher" : "Afficher"} les mots de passe
              </div>

              <Button type="submit" className="w-full bg-[#cd7455] text-white">
                Réinitialiser
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
