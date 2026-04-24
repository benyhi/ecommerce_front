import HeroCarousel from "@/components/home/HeroCarousel";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PostsSection from "@/components/home/PostsSection";
import StoreMap from "@/components/home/StoreMap";
import { getSiteBanners, getFeaturedProducts, getSitePosts } from "@/lib/api";

export const revalidate = 60;

export default async function HomePage() {
  const tenant = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "tienda1";

  const [banners, featuredItems, posts] = await Promise.all([
    getSiteBanners(tenant),
    getFeaturedProducts(tenant),
    getSitePosts(tenant),
  ]);

  return (
    <>
      <HeroCarousel banners={banners} />
      <FeaturedProducts items={featuredItems} />
      <PostsSection posts={posts} />
      <StoreMap />
    </>
  );
}
