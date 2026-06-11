import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading, signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/admin');
  }, [navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: 'Erro ao entrar',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Login realizado',
        description: 'Você já pode gerenciar o cardápio.',
      });
      navigate('/admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: 'Informe seu email',
        description: 'Digite o email da conta para receber o link de redefinicao.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: 'Erro ao enviar link',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Link enviado',
        description: 'Confira seu email e abra o link para criar uma nova senha.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] bg-[radial-gradient(circle_at_18%_18%,rgba(0,87,255,0.10),transparent_30%),linear-gradient(135deg,#FFFFFF_0%,#F2F4F7_48%,#E8EEF8_100%)] px-4 py-8 font-sans text-[#0B1325]">
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <section
          className="w-[calc(100%-32px)] max-w-[460px] rounded-[28px] border border-[#E2E8F0] bg-white px-7 py-10 shadow-[0_26px_70px_rgba(11,19,37,0.14)] sm:px-12 sm:py-12"
          aria-labelledby="admin-login-title"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex items-center justify-center gap-3">
              <img
                src="/arm-logo-transparent.png"
                alt="ARM"
                className="h-16 w-auto max-w-[190px] object-contain sm:h-[74px]"
              />
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
              >
                <path
                  d="M9 14L31.5 22.5V53L9 44.5V14Z"
                  stroke="#0B1325"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M55 14L31.5 22.5V53L55 44.5V14Z"
                  stroke="#0B1325"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path d="M40 29L49 26" stroke="#0057FF" strokeWidth="4" strokeLinecap="round" />
                <path d="M40 37L49 34" stroke="#0B1325" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M40 45L49 42" stroke="#0057FF" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <h1 id="admin-login-title" className="text-[1.65rem] font-bold leading-tight tracking-normal text-[#0B1325] sm:text-[1.8rem]">
              ARM Cardápios Admin
            </h1>
            <p className="mt-2 text-sm font-medium text-[#667085]">Acesse o painel administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Label htmlFor="email" className="sr-only">
                E-mail
              </Label>
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#70809A]" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-14 rounded-xl border-[#D8E0EA] bg-white pl-[52px] pr-4 text-[0.95rem] font-medium text-[#0B1325] shadow-none transition placeholder:text-[#8A97AB] focus-visible:border-[#0057FF] focus-visible:ring-4 focus-visible:ring-[#0057FF]/15"
                placeholder="E-mail"
                autoComplete="email"
                required
              />
            </div>

            <div className="relative">
              <Label htmlFor="password" className="sr-only">
                Senha
              </Label>
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#70809A]" aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 rounded-xl border-[#D8E0EA] bg-white pl-[52px] pr-12 text-[0.95rem] font-medium text-[#0B1325] shadow-none transition placeholder:text-[#8A97AB] focus-visible:border-[#0057FF] focus-visible:ring-4 focus-visible:ring-[#0057FF]/15"
                placeholder="Senha"
                autoComplete="current-password"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#70809A] transition hover:bg-[#F2F4F7] hover:text-[#0B1325] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0057FF]/20"
                disabled={isSubmitting}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex min-w-0 items-center gap-2 font-medium text-[#667085]">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-[#D8E0EA] text-[#0057FF] accent-[#0057FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0057FF]/20"
                />
                <span>Lembrar-me</span>
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                className="shrink-0 rounded-md font-semibold text-[#0057FF] transition hover:text-[#0046CC] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0057FF]/20"
                disabled={isSubmitting}
              >
                Esqueceu sua senha?
              </button>
            </div>

            <Button
              type="submit"
              className="h-14 w-full rounded-xl bg-[#0057FF] text-base font-semibold text-white shadow-[0_14px_26px_rgba(0,87,255,0.28)] transition hover:bg-[#004BE0] focus-visible:ring-4 focus-visible:ring-[#0057FF]/25 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Entrar
            </Button>
          </form>
        </section>

        <footer className="mt-8 flex flex-col items-center gap-3 text-center">
          <img
            src="/arm-cardapios-footer-logo.png"
            alt="ARM Cardápios"
            className="h-auto w-full max-w-[280px] object-contain sm:max-w-[340px]"
          />
          <p className="text-sm font-medium text-[#667085]">
            Design minimalista. Identidade forte. Experiência profissional.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Auth;
