import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {SignUpForm} from "@/components/sign-up-form.tsx";

export default function SignUp() {
	return (
			<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-zinc-900">
				<div className="w-full max-w-sm">
					<Card className="bg-zinc-800">
						<CardHeader>
							<CardTitle className="text-xl text-center">Sign into your account</CardTitle>
							<CardDescription className="text-center">
								Enter your credentials
							</CardDescription>
						</CardHeader>
						<CardContent><SignUpForm/></CardContent>
					</Card>
				</div>
			</div>

	)
}

