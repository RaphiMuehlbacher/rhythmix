import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Link, Navigate} from "react-router"
import {z} from "zod"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {useAuthActions} from "@convex-dev/auth/react"
import {useConvexAuth} from "convex/react";

const formSchema = z.object({
	email: z.email(),
	password: z
			.string()
			.min(8, {message: "Minimum 8 characters"})
			.refine((val) => !val.includes(" "), {message: "Spaces are not allowed"}),
})

export function LoginForm() {
	const {signIn} = useAuthActions()
	const {isAuthenticated} = useConvexAuth();


	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	if (isAuthenticated) return <Navigate to="/" replace/>

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		await signIn("password", {flow: "signIn", email: data.email, password: data.password})
	}

	const signInGoogle = async () => {
		await signIn("google", {redirectTo: "/"})
	}

	return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-6">
						<FormField
								control={form.control}
								name="email"
								render={({field}) => (
										<FormItem className="grid gap-2">
											<FormLabel htmlFor="email">Email</FormLabel>
											<FormControl>
												<Input
														id="email"
														type="email"
														placeholder=""
														className="border-neutral-700"
														{...field}
												/>
											</FormControl>
											<FormMessage className="text-xs text-red-500"/>
										</FormItem>
								)}
						/>

						<FormField
								control={form.control}
								name="password"
								render={({field}) => (
										<FormItem className="grid gap-2">
											<div className="flex items-center">
												<FormLabel htmlFor="password">Password</FormLabel>
												<a
														href="#"
														className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
												>
													Forgot your password?
												</a>
											</div>
											<FormControl>
												<Input
														id="password"
														type="password"
														className="border-neutral-700"
														placeholder=""
														{...field}
												/>
											</FormControl>
											<FormMessage className="text-xs text-red-500"/>
										</FormItem>
								)}
						/>

						<div className="flex flex-col gap-3">
							<Button
									type="submit"
									className="w-full rounded-xl py-5 text-base border-neutral-700 font-semibold shadow-sm bg-zinc-900"
									variant="outline"
							>
								Login
							</Button>
							<Button
									type="button"
									variant="outline"
									className="w-full flex items-center border-neutral-700 justify-center gap-2 rounded-xl py-5 text-base font-semibold bg-zinc-900"
									onClick={signInGoogle}
							>
								<svg className="size-5" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg"
										 preserveAspectRatio="xMidYMid">
									<path
											d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
											fill="#4285F4"/>
									<path
											d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
											fill="#34A853"/>
									<path
											d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
											fill="#FBBC05"/>
									<path
											d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
											fill="#EB4335"/>
								</svg>
								Sign in Google
							</Button>
						</div>
					</div>

					<div className="mt-4 text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link
								to="/sign-up"
								className="font-medium underline underline-offset-4"
						>
							Sign up
						</Link>
					</div>
				</form>
			</Form>
	)
}
