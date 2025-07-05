export default function PublicFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TechTicker. All Rights Reserved.
      </div>
    </footer>
  );
}
