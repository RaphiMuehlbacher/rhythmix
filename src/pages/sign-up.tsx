import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {SignUpForm} from "@/components/sign-up-form.tsx";

export default function SignUp() {
	return (
			<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#131516]">
				<div className="w-full max-w-sm">
					<Card className="bg-[#1E2122] text-white border-[#303537]">
						<CardHeader>
							<CardTitle className="text-xl text-center">Sign into your account</CardTitle>
							<CardDescription className="text-center text-neutral-500">
								Enter your credentials
							</CardDescription>
						</CardHeader>
						<CardContent><SignUpForm/></CardContent>
					</Card>
				</div>
			</div>

	)
}

