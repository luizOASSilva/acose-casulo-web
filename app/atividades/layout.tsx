export default function AtividadesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <h1 className="sr-only">Atividades</h1>
      {children}
      {modal}
    </>
  );
}
