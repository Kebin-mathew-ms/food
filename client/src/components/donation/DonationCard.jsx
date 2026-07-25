import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Eye, Edit2 } from 'lucide-react';
import DonationStatusBadge from './DonationStatusBadge.jsx';
import CountdownTimer from './CountdownTimer.jsx';

/**
 * Renders donation listing summary cards.
 */
export const DonationCard = ({ donation, onCancel, onExpire }) => {
  const coverImage = donation.donation_images?.[0]?.image_url || null;

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      
      {/* Listing Cover Image */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/..${coverImage}` : coverImage}
            alt={donation.food_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-semibold">
            No Image Provided
          </div>
        )}
        <div className="absolute top-2 right-2">
          <DonationStatusBadge status={donation.status} />
        </div>
      </div>

      {/* Listing Body Content */}
      <div className="flex-1 p-5 space-y-4">
        <div>
          <span className="text-3xs uppercase tracking-wider font-bold text-primary">
            {donation.food_category}
          </span>
          <h3 className="text-lg font-bold text-foreground line-clamp-1 mt-0.5">
            {donation.food_name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {donation.description}
          </p>
        </div>

        {/* Specs Parameters */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span>Serves {donation.number_of_people || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{donation.quantity} {donation.quantity_unit}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 truncate">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{donation.pickup_city || 'Local Area'}</span>
          </div>
        </div>

        {/* Live Countdown */}
        {donation.status === 'AVAILABLE' && (
          <div className="flex justify-between items-center bg-accent/50 p-2.5 rounded-lg border border-border/40">
            <span className="text-xs text-muted-foreground">Expires in:</span>
            <CountdownTimer expiryTime={donation.expiry_time} onExpire={onExpire} />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border flex items-center gap-2 bg-muted/30">
        <Link
          to={`/donations/${donation.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border border-input bg-background text-foreground hover:bg-accent transition-all"
        >
          <Eye className="w-3.5 h-3.5" /> View Details
        </Link>

        {donation.status === 'AVAILABLE' && (
          <>
            <Link
              to={`/donations/${donation.id}/edit`}
              className="inline-flex items-center justify-center p-2 rounded-lg border border-input bg-background text-foreground hover:text-primary hover:bg-accent transition-all"
              title="Edit listing"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => onCancel(donation.id)}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
            >
              Cancel
            </button>
          </>
        )}
      </div>

    </div>
  );
};

export default DonationCard;
