'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Eye, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const categoryOptions = [
  { value: 'risk-parameter-update', label: 'Risk Parameter Update' },
  { value: 'asset-listing', label: 'Asset Listing' },
  { value: 'treasury-action', label: 'Treasury Action' },
  { value: 'protocol-upgrade', label: 'Protocol Upgrade' },
] as const;

const actionTypeOptions = [
  { value: 'parameter-change', label: 'Parameter Change' },
  { value: 'contract-call', label: 'Contract Call' },
  { value: 'treasury-transfer', label: 'Treasury Transfer' },
] as const;

const functionSelectorOptions = [
  { value: 'setLTV(address asset, uint256 newLTV)', label: 'setLTV(address asset, uint256 newLTV)' },
  {
    value: 'setLiquidationThreshold(address asset, uint256 threshold)',
    label: 'setLiquidationThreshold(address asset, uint256 threshold)',
  },
  {
    value: 'setReserveFactor(address asset, uint256 reserveFactor)',
    label: 'setReserveFactor(address asset, uint256 reserveFactor)',
  },
] as const;

const proposalSchema = z.object({
  title: z.string().trim().min(8, 'Proposal title must be at least 8 characters.'),
  category: z.enum(['risk-parameter-update', 'asset-listing', 'treasury-action', 'protocol-upgrade']),
  description: z.string().trim().min(80, 'Description must include at least 80 characters of rationale.'),
  actions: z
    .array(
      z.object({
        actionType: z.enum(['parameter-change', 'contract-call', 'treasury-transfer']),
        contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Enter a valid EVM contract address.'),
        functionSelector: z.enum([
          'setLTV(address asset, uint256 newLTV)',
          'setLiquidationThreshold(address asset, uint256 threshold)',
          'setReserveFactor(address asset, uint256 reserveFactor)',
        ]),
        asset: z.string().trim().min(3, 'Asset is required.'),
        newLtv: z.number().min(1, 'Value must be at least 1%.').max(100, 'Value cannot exceed 100%.'),
      })
    )
    .min(1, 'Add at least one executable action.'),
  governance: z.object({
    votingDelay: z.number().int().min(0, 'Voting delay cannot be negative.').max(30, 'Voting delay is too long.'),
    votingPeriod: z
      .number()
      .int()
      .min(1, 'Voting period must be at least 1 day.')
      .max(30, 'Voting period is too long.'),
    quorum: z.number().min(1, 'Quorum must be at least 1%.').max(100, 'Quorum cannot exceed 100%.'),
  }),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;
type SubmitIntent = 'draft' | 'publish';

const defaultAction: ProposalFormValues['actions'][number] = {
  actionType: 'parameter-change',
  contractAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
  functionSelector: 'setLTV(address asset, uint256 newLTV)',
  asset: '0xC02aa... (WETH)',
  newLtv: 85,
};

const defaultValues: ProposalFormValues = {
  title: '',
  category: 'risk-parameter-update',
  description: '',
  actions: [defaultAction],
  governance: {
    votingDelay: 2,
    votingPeriod: 5,
    quorum: 4,
  },
};

const fieldLabelClassName = 'font-semibold text-muted-foreground text-xs uppercase tracking-[0.12em]';
const inputClassName = 'h-10 rounded-xs bg-muted';
const selectTriggerClassName = 'h-10 w-full rounded-xs bg-muted';
const textareaClassName = 'min-h-48 rounded-xs bg-muted';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

function FieldShell({ label, error, hint, className, children }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} data-invalid={Boolean(error)}>
      <Label className={fieldLabelClassName}>{label}</Label>
      {children}
      {error ? (
        <p className='text-destructive text-xs'>{error}</p>
      ) : hint ? (
        <p className='text-[11px] text-muted-foreground uppercase'>{hint}</p>
      ) : null}
    </div>
  );
}

function SectionTitle({ number, title, action }: { number: number; title: string; action?: React.ReactNode }) {
  return (
    <CardHeader className='border-b py-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <CardTitle className='font-serif text-2xl text-primary'>
          {number}. {title}
        </CardTitle>
        {action}
      </div>
    </CardHeader>
  );
}

export function ProposalForm() {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const submitIntentRef = useRef<SubmitIntent>('publish');

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actions',
  });

  const description = watch('description');

  const onSubmit = async (values: ProposalFormValues) => {
    const intent = submitIntentRef.current;

    toast.success(intent === 'draft' ? 'Proposal draft saved.' : 'Proposal is ready for voting.', {
      description: `${values.actions.length} executable action${values.actions.length > 1 ? 's' : ''} configured.`,
    });
  };

  return (
    <main className='mx-auto flex w-full max-w-5xl flex-col gap-8 py-2 md:py-6'>
      <header className='flex flex-col gap-3'>
        <h1 className='font-serif text-4xl text-primary leading-tight tracking-tight sm:text-5xl'>
          Create New Proposal
        </h1>
        <p className='max-w-3xl text-muted-foreground'>
          Configure institutional governance actions for the DeFiLend Prime ecosystem.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-8'>
        <Card className='gap-0 overflow-hidden rounded-xs border-border py-0 shadow-none'>
          <section>
            <SectionTitle number={1} title='Basic Information' />
            <CardContent className='grid gap-6 py-6 md:grid-cols-[minmax(0,1fr)_272px]'>
              <FieldShell label='Proposal Title' error={errors.title?.message}>
                <Input
                  className={inputClassName}
                  placeholder='e.g. PIP-42: Adjust LTV for rETH Market'
                  aria-invalid={Boolean(errors.title)}
                  {...register('title')}
                />
              </FieldShell>

              <FieldShell label='Category' error={errors.category?.message}>
                <Controller
                  control={control}
                  name='category'
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={selectTriggerClassName} aria-invalid={Boolean(errors.category)}>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FieldShell>
            </CardContent>
          </section>

          <section>
            <SectionTitle
              number={2}
              title='Description'
              action={
                <Button type='button' variant='outline' size='sm' onClick={() => setIsPreviewing((value) => !value)}>
                  <Eye data-icon='inline-start' />
                  {isPreviewing ? 'Edit' : 'Preview'}
                </Button>
              }
            />
            <CardContent className='py-6'>
              <FieldShell label='Detailed Content (Markdown Supported)' error={errors.description?.message}>
                {isPreviewing ? (
                  <div className='min-h-48 whitespace-pre-wrap rounded-xs border border-input bg-muted px-4 py-4 text-sm leading-7'>
                    {description || 'Preview will appear here as you write the proposal rationale.'}
                  </div>
                ) : (
                  <Textarea
                    className={textareaClassName}
                    rows={8}
                    placeholder='Provide a comprehensive rationale for this proposal, including data analysis and potential impact...'
                    aria-invalid={Boolean(errors.description)}
                    {...register('description')}
                  />
                )}
              </FieldShell>
            </CardContent>
          </section>

          <section>
            <SectionTitle number={3} title='Executable Actions' />
            <CardContent className='flex flex-col gap-4 py-6'>
              {fields.map((field, index) => {
                const actionErrors = errors.actions?.[index];

                return (
                  <div key={field.id} className='flex flex-col gap-6 rounded-xs border border-border bg-muted/40 p-5'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                      <FieldShell
                        label='Action Type'
                        error={actionErrors?.actionType?.message}
                        className='w-full sm:max-w-lg'
                      >
                        <Controller
                          control={control}
                          name={`actions.${index}.actionType`}
                          render={({ field: actionTypeField }) => (
                            <Select value={actionTypeField.value} onValueChange={actionTypeField.onChange}>
                              <SelectTrigger
                                className={selectTriggerClassName}
                                aria-invalid={Boolean(actionErrors?.actionType)}
                              >
                                <SelectValue placeholder='Select action type' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {actionTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FieldShell>

                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='w-fit text-destructive hover:text-destructive'
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <Trash2 data-icon='inline-start' />
                        Remove
                      </Button>
                    </div>

                    <Separator />

                    <div className='grid gap-6 md:grid-cols-2'>
                      <FieldShell label='Contract Address' error={actionErrors?.contractAddress?.message}>
                        <Input
                          className={inputClassName}
                          aria-invalid={Boolean(actionErrors?.contractAddress)}
                          {...register(`actions.${index}.contractAddress`)}
                        />
                      </FieldShell>

                      <FieldShell label='Function Selector' error={actionErrors?.functionSelector?.message}>
                        <Controller
                          control={control}
                          name={`actions.${index}.functionSelector`}
                          render={({ field: functionField }) => (
                            <Select value={functionField.value} onValueChange={functionField.onChange}>
                              <SelectTrigger
                                className={selectTriggerClassName}
                                aria-invalid={Boolean(actionErrors?.functionSelector)}
                              >
                                <SelectValue placeholder='Select function' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {functionSelectorOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </FieldShell>

                      <FieldShell label='Asset (Parameter 1)' error={actionErrors?.asset?.message}>
                        <Input
                          className={inputClassName}
                          aria-invalid={Boolean(actionErrors?.asset)}
                          {...register(`actions.${index}.asset`)}
                        />
                      </FieldShell>

                      <FieldShell label='NewLTV (Parameter 2)' error={actionErrors?.newLtv?.message}>
                        <div className='relative'>
                          <Input
                            type='number'
                            min={1}
                            max={100}
                            aria-invalid={Boolean(actionErrors?.newLtv)}
                            className={cn(inputClassName, 'pr-10')}
                            {...register(`actions.${index}.newLtv`, { valueAsNumber: true })}
                          />
                          <span className='-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm'>
                            %
                          </span>
                        </div>
                      </FieldShell>
                    </div>
                  </div>
                );
              })}

              <Button
                type='button'
                variant='outline'
                className='h-12 border-dashed text-primary'
                onClick={() => append({ ...defaultAction })}
              >
                <Plus data-icon='inline-start' />
                Add Action
              </Button>
              {errors.actions?.root?.message ? (
                <p className='text-destructive text-xs'>{errors.actions.root.message}</p>
              ) : null}
            </CardContent>
          </section>

          <section>
            <SectionTitle number={4} title='Governance Settings' />
            <CardContent className='grid gap-6 py-6 md:grid-cols-3'>
              <FieldShell
                label='Voting Delay'
                error={errors.governance?.votingDelay?.message}
                hint='Time between publishing and start of voting.'
              >
                <div className='relative'>
                  <Input
                    type='number'
                    min={0}
                    aria-invalid={Boolean(errors.governance?.votingDelay)}
                    className={cn(inputClassName, 'pr-16')}
                    {...register('governance.votingDelay', { valueAsNumber: true })}
                  />
                  <span className='-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-xs uppercase'>
                    Days
                  </span>
                </div>
              </FieldShell>

              <FieldShell
                label='Voting Period'
                error={errors.governance?.votingPeriod?.message}
                hint='Total duration voting remains open.'
              >
                <div className='relative'>
                  <Input
                    type='number'
                    min={1}
                    aria-invalid={Boolean(errors.governance?.votingPeriod)}
                    className={cn(inputClassName, 'pr-16')}
                    {...register('governance.votingPeriod', { valueAsNumber: true })}
                  />
                  <span className='-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-xs uppercase'>
                    Days
                  </span>
                </div>
              </FieldShell>

              <FieldShell
                label='Quorum'
                error={errors.governance?.quorum?.message}
                hint='Min. percentage of total supply required.'
              >
                <div className='relative'>
                  <Input
                    type='number'
                    min={1}
                    max={100}
                    aria-invalid={Boolean(errors.governance?.quorum)}
                    className={cn(inputClassName, 'pr-10')}
                    {...register('governance.quorum', { valueAsNumber: true })}
                  />
                  <span className='-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 text-muted-foreground text-sm'>
                    %
                  </span>
                </div>
              </FieldShell>
            </CardContent>
          </section>

          <CardFooter className='flex flex-col gap-3 border-t py-6 sm:flex-row sm:justify-end'>
            <Button type='button' variant='ghost' asChild>
              <Link href='/governance'>Cancel</Link>
            </Button>
            <Button
              type='submit'
              variant='outline'
              loading={isSubmitting && submitIntentRef.current === 'draft'}
              onClick={() => {
                submitIntentRef.current = 'draft';
              }}
            >
              Save Draft
            </Button>
            <Button
              type='submit'
              loading={isSubmitting && submitIntentRef.current === 'publish'}
              onClick={() => {
                submitIntentRef.current = 'publish';
              }}
            >
              Publish for Voting
            </Button>
          </CardFooter>
        </Card>

        <Alert variant='warning' className='border-l-4 border-l-warning'>
          <AlertTriangle />
          <AlertDescription className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <span>
              You need <strong>1,000 Q LEAP</strong> voting power to submit this proposal.{' '}
              <span className='font-mono'>Your balance: 2,450 qGOV</span>
            </span>
            <span className='rounded-xs border border-success/30 bg-success/10 px-3 py-1 font-semibold text-success text-xs uppercase tracking-[0.12em]'>
              Eligible
            </span>
          </AlertDescription>
        </Alert>
      </form>
    </main>
  );
}
