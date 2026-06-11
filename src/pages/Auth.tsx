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
        description: 'Voce ja pode gerenciar o cardapio.',
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold">Area Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acesse para gerenciar cardapios.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-10"
                placeholder="admin@restaurante.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="pl-10 pr-10"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>

        <button
          type="button"
          onClick={handleResetPassword}
          className="mt-4 w-full text-center text-sm text-primary hover:underline"
          disabled={isSubmitting}
        >
          Esqueci minha senha
        </button>
      </div>
    </div>
  );
};

export default Auth;
