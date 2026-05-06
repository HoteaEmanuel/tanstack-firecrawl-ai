import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import { loginSchema } from '#/schemas/auth'
import { useForm } from '@tanstack/react-form'
import { useState, useTransition } from 'react'
import { Eye, EyeClosed } from 'lucide-react'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'
export function LoginForm() {
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false)

  const [isPending, startTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: ({ value }) => {
      startTransition(async () => {
        await authClient.signIn.email({
          email: value.email,
          password: value.password,
          // callbackURL:'/',
          fetchOptions: {
            onSuccess: () => {
              toast.success('Loghed in!')
              console.log('SUCCESS')
              navigate({ to: '/dashboard' })
            },
            onError: () => {
              toast.error('Invalid password or email')
            },
          },
        })
      })
    },
  })
  return (
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">
          Login to your account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            console.log(e)
            form.handleSubmit()
            // form.reset();
          }}
          className="p-4"
        >
          <FieldGroup>
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="arthur@morgan.com"
                      type="email"
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        type={passwordVisible ? 'text' : 'password'}
                        className="pr-5"
                      />
                      <div
                        className="absolute top-2 right-1"
                        onClick={() => {
                          setPasswordVisible((prev) => !prev)
                        }}
                      >
                        {passwordVisible ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeClosed className="size-4" />
                        )}
                      </div>
                    </div>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <Field>
              <Button type="submit" disabled={isPending}>
                {' '}
                {isPending ? 'Loggin..' : 'Log in'}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link to="/signup">Sign up</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
