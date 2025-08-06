import { Star } from 'lucide-react'
import { Testimonial } from '../types'

interface TestimonialCardProps {
  testimonial: Testimonial
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="card">
      {/* Rating */}
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < testimonial.rating
                ? 'fill-current text-yellow-400'
                : 'text-cream-300'
            }`}
          />
        ))}
      </div>

      {/* Comment */}
      <blockquote className="text-brown-700 mb-4 italic">
        "{testimonial.comment}"
      </blockquote>

      {/* Customer Info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-brown-900">
            {testimonial.name}
          </div>
          <div className="text-sm text-brown-600">
            {testimonial.location}
          </div>
        </div>
        <div className="text-xs text-brown-500">
          {formatDate(testimonial.date)}
        </div>
      </div>

      {/* Product Category */}
      {testimonial.productCategory && (
        <div className="mt-3">
          <span className="text-xs bg-cream-100 text-brown-700 px-2 py-1 rounded-full">
            {testimonial.productCategory}
          </span>
        </div>
      )}
    </div>
  )
}

export default TestimonialCard 