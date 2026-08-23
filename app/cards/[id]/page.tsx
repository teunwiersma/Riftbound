import Link from "next/link";

import { notFound } from "next/navigation";

import { getBaseUrl } from "@/lib/api-client";

import type { RiftboundCard } from "@/lib/types";

import { CollectionButton } from "../../CollectionButton";

import { SiteHeader } from "../../SiteHeader";

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const baseUrl = await getBaseUrl();

  const res = await fetch(`${baseUrl}/api/cards/${(await params).id}`, { cache: "no-store" });
  if (res.status === 404) notFound();
  const card = (await res.json()) as RiftboundCard;
  return (
    <div className="atlas-shell">
      <SiteHeader />
      <main className="atlas-main">
        <Link className="back-link" href="/cards">
          ← Back to archive
        </Link>
        <div className="detail-layout">
          <div>
            <img
              className="detail-image"
              src={card.cardImage.url}
              alt={card.cardImage.accessibilityText}
            />
          </div>
          <article className="detail-content">
            <span className="eyebrow">
              {card.setName} · {card.publicCode}
            </span>
            <h1>{card.name}</h1>
            <span className="detail-code">
              {card.cardType.map((item) => item.label).join(" · ")} / Illustrated by{" "}
              {card.illustrator.join(", ")}
            </span>
            <div className="detail-tags">
              {card.domains.map((item) => (
                <span className="detail-tag" key={item.id}>
                  {item.label}
                </span>
              ))}
              <span className="detail-tag">{card.rarity.label}</span>
            </div>
            <CollectionButton cardId={card.id} />
            <div
              className="detail-text"
              dangerouslySetInnerHTML={{ __html: card.text.replaceAll("_", "") }}
            />
            <dl className="detail-facts">
              <div className="detail-fact">
                <dt>Energy</dt>
                <dd>{card.energy ?? "-"}</dd>
              </div>
              <div className="detail-fact">
                <dt>Power</dt>
                <dd>{card.power ?? "-"}</dd>
              </div>
              <div className="detail-fact">
                <dt>Collector no.</dt>
                <dd>{card.collectorNumber}</dd>
              </div>
            </dl>
          </article>
        </div>
      </main>
    </div>
  );
}
