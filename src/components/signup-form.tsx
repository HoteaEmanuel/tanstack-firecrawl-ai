import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeClosed } from 'lucide-react'
import { useForm } from '@tanstack/react-form'

import { signUpSchema } from '#/schemas/auth.ts'
import { useState, useTransition } from 'react'
import { authClient } from '#/lib/auth-client'
import { toast } from 'sonner'
export function SignupForm({ ...props }) {
  const navigate = useNavigate()

  const [isPending, startTransition] = useTransition()
  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signUpSchema,
    },

    onSubmit: ({ value }) => {
      startTransition(async () => {
        await authClient.signUp.email({
          email: value.email,
          name: value.fullName,
          password: value.password,
          // callbackURL:'/dashboard',
          fetchOptions: {
            onSuccess: () => {
              toast.success('Sign up succesfully')
              navigate({ to: '/dashboard' })
            },
          },
        })
      })
    },
  })

  const [passwordVisible, setPasswordVisible] = useState(false)
  return (
    <Card {...props} className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-center font-semibold text-xl">
          Create an account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="fullName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Arthur Morgan"
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
            <FieldGroup>
              <div className="flex gap-2">
                Already have an account ? -
                <Link to="/login" className="flex">
                  Sign in
                </Link>
              </div>
            </FieldGroup>
            <FieldGroup>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating account...' : 'Create account'}
              </Button>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
