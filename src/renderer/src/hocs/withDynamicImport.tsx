import { Suspense, lazy, ComponentType, ReactElement, FC, useRef, useEffect, } from 'react';
import gsap from 'gsap';

function withGsapAnimation<P extends object>(WrappedComponent: ComponentType<P>): FC<P> {
  const GsapAnimated: FC<P> = (props) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (ref.current) {
        gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 1 });
      }
    }, []);

    return <WrappedComponent {...props} />
  };

  return GsapAnimated;
};

export function withDynamicPages<T>(opts: { pageName: string, loader?: ReactElement }, props?: T): ReactElement<T> {

  const Content = lazy<FC<any>>(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const module = await import(`./../pages/${opts.pageName}/index.ts`);
    const GsapWrapped = withGsapAnimation<ComponentType<T>>(module.default);

    return { default: GsapWrapped };
  });

  return <Suspense fallback={opts.loader}>
    <Content {...props} />
  </Suspense>
};
