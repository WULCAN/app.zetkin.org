import { AppProps } from 'next/app';
import DefualtLayout from '../layout/DefaultLayout';
import { Hydrate } from 'react-query/hydration';
import { NextPage } from 'next/types';
import { ReactQueryDevtools } from 'react-query/devtools';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

interface WithLayout {
    getLayout(page, props): JSX.Element,
}

type PageWithLayout = NextPage & WithLayout;

function MyApp({ Component, pageProps } : AppProps) : JSX.Element {
    const { dehydratedState, ...restProps } = pageProps;
    const c = Component as PageWithLayout;
    const getLayout = c.getLayout || (page => <DefualtLayout>{ page }</DefualtLayout>);

    return (
        <QueryClientProvider client={ queryClient }>
            <Hydrate state={ dehydratedState }>
                { getLayout(<Component { ...restProps } />, restProps) }
            </Hydrate>
            <ReactQueryDevtools initialIsOpen={ false } />
        </QueryClientProvider>
    );
}

export default MyApp;